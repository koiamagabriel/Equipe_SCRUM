const express = require('express');
const cors = require('cors');
const { DatabaseSync } = require('node:sqlite');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3001;
const JWT_SECRET = 'fei_reservas_super_secret_key'; // Hardcoded for simplicity

// Habilitar CORS para http://localhost:5173
app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

// Banco de dados SQLite salvo em site_fei/backend/fei_reservas.db
const dbPath = path.join(__dirname, 'fei_reservas.db');
const db = new DatabaseSync(dbPath);

// Inicializar tabelas
db.exec(`
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  email TEXT,
  senha_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  papel TEXT NOT NULL CHECK(papel IN ('Aluno', 'Professor', 'Admin')),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK(status IN ('ativo', 'inativo'))
);

CREATE TABLE IF NOT EXISTS espacos (
  id TEXT PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  capacidade INTEGER NOT NULL,
  localizacao TEXT NOT NULL,
  observacoes TEXT
);

CREATE TABLE IF NOT EXISTS reservas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_espaco TEXT NOT NULL REFERENCES espacos(id),
  id_usuario INTEGER NOT NULL REFERENCES usuarios(id),
  data TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT NOT NULL,
  finalidade TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativa' CHECK(status IN ('ativa', 'cancelada'))
);
`);

// Seeds (inserir se as tabelas estiverem vazias)
const usuariosCount = db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count;
if (usuariosCount === 0) {
  const insertUser = db.prepare(`
    INSERT INTO usuarios (username, senha_hash, nome, papel) 
    VALUES (?, ?, ?, ?)
  `);
  
  // Senhas cacheadas com bcrypt
  const hash1234 = bcrypt.hashSync('1234', 10);
  const hashAdmin = bcrypt.hashSync('admin', 10);
  
  insertUser.run('aluno', hash1234, 'João Silva', 'Aluno');
  insertUser.run('professor', hash1234, 'Profa. Maria', 'Professor');
  insertUser.run('admin', hashAdmin, 'Administrador', 'Admin');
}

const espacosCount = db.prepare('SELECT COUNT(*) as count FROM espacos').get().count;
if (espacosCount === 0) {
  const insertEspaco = db.prepare(`
    INSERT INTO espacos (id, nome, tipo, capacidade, localizacao, observacoes) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  insertEspaco.run('A101', 'Sala A101', 'Sala de Aula', 40, 'Bloco A, 1º Andar', 'Equipada com projetor, quadro branco e ar-condicionado.');
  insertEspaco.run('A102', 'Sala A102', 'Sala de Aula', 35, 'Bloco A, 1º Andar', 'Sala padrão com quadro branco.');
  insertEspaco.run('B201', 'Sala B201', 'Sala de Aula', 50, 'Bloco B, 2º Andar', 'Sala grande com sistema de som.');
  insertEspaco.run('LAB1', 'Lab. de Informática 1', 'Laboratório', 30, 'Bloco C, Térreo', '30 computadores com acesso à internet.');
  insertEspaco.run('LAB2', 'Lab. de Informática 2', 'Laboratório', 25, 'Bloco C, Térreo', '25 computadores com softwares de engenharia.');
  insertEspaco.run('LAB3', 'Lab. de Eletrônica', 'Laboratório', 20, 'Bloco D, 1º Andar', 'Equipado com bancadas e osciloscópios.');
  insertEspaco.run('AUD', 'Auditório Principal', 'Auditório', 200, 'Bloco E, Térreo', 'Auditório principal para eventos e palestras.');
  insertEspaco.run('REU1', 'Sala de Reuniões 1', 'Sala de Reunião', 12, 'Bloco A, 2º Andar', 'Sala executiva com TV e videoconferência.');
}

const reservasCount = db.prepare('SELECT COUNT(*) as count FROM reservas').get().count;
if (reservasCount === 0) {
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);

  const formataData = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD
  const dataHoje = formataData(hoje);
  const dataAmanha = formataData(amanha);

  const insertReserva = db.prepare(`
    INSERT INTO reservas (id_espaco, id_usuario, data, hora_inicio, hora_fim, finalidade) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  // Usuario IDs (aluno=1, professor=2, admin=3 se auto-increment for na ordem inserida)
  insertReserva.run('A101', 2, dataHoje, '08:00', '10:00', 'Aula de Cálculo');
  insertReserva.run('A101', 2, dataHoje, '10:00', '12:00', 'Aula de Física');
  insertReserva.run('LAB1', 1, dataAmanha, '14:00', '16:00', 'Trabalho de Programação');
  insertReserva.run('AUD', 3, dataAmanha, '19:00', '21:00', 'Palestra Inaugural');
}

// Middleware de autenticação
const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Acesso negado. Token ausente.' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido ou expirado.' });
    req.usuario = decoded; // { id, username, papel }
    next();
  });
};

// Endpoints da API

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Usuário e senha são obrigatórios.' });

  const usuario = db.prepare('SELECT * FROM usuarios WHERE username = ?').get(username);
  if (!usuario) return res.status(401).json({ message: 'Credenciais inválidas.' });

  if (usuario.status !== 'ativo') return res.status(403).json({ message: 'Usuário inativo.' });

  const isValida = bcrypt.compareSync(password, usuario.senha_hash);
  if (!isValida) return res.status(401).json({ message: 'Credenciais inválidas.' });

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, papel: usuario.papel }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );

  res.json({ token });
});

// GET /api/auth/me (token obrigatório)
app.get('/api/auth/me', autenticarToken, (req, res) => {
  const usuario = db.prepare('SELECT id, username, email, nome, papel, status FROM usuarios WHERE id = ?').get(req.usuario.id);
  if (!usuario) return res.status(404).json({ message: 'Usuário não encontrado.' });
  res.json(usuario);
});

// GET /api/espacos — query param opcional ?tipo=Laboratório
app.get('/api/espacos', (req, res) => {
  const { tipo } = req.query;
  if (tipo) {
    const espacos = db.prepare('SELECT * FROM espacos WHERE tipo = ?').all(tipo);
    return res.json(espacos);
  }
  const espacos = db.prepare('SELECT * FROM espacos').all();
  res.json(espacos);
});

// GET /api/espacos/:id
app.get('/api/espacos/:id', (req, res) => {
  const espaco = db.prepare('SELECT * FROM espacos WHERE id = ?').get(req.params.id);
  if (!espaco) return res.status(404).json({ message: 'Espaço não encontrado.' });
  res.json(espaco);
});

// GET /api/reservas/disponibilidade (token obrigatório) — query: ?id_espaco=A101&data=2025-03-19
app.get('/api/reservas/disponibilidade', autenticarToken, (req, res) => {
  const { id_espaco, data } = req.query;
  if (!id_espaco || !data) return res.status(400).json({ message: 'Faltando id_espaco ou data.' });

  const espaco = db.prepare('SELECT * FROM espacos WHERE id = ?').get(id_espaco);
  if (!espaco) return res.status(404).json({ message: 'Espaço não encontrado.' });

  const reservas = db.prepare(`
    SELECT r.id, r.id_espaco, r.hora_inicio as startTime, r.hora_fim as endTime, r.finalidade as purpose, u.nome as userName 
    FROM reservas r
    JOIN usuarios u ON r.id_usuario = u.id
    WHERE r.id_espaco = ? AND r.data = ? AND r.status = 'ativa'
    ORDER BY r.hora_inicio ASC
  `).all(id_espaco, data);
  
  res.json(reservas);
});

// POST /api/reservas (token obrigatório)
app.post('/api/reservas', autenticarToken, (req, res) => {
  const { id_espaco, data, hora_inicio, hora_fim, finalidade } = req.body;
  if (!id_espaco || !data || !hora_inicio || !hora_fim || !finalidade) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }

  // validações de horário
  if (hora_inicio >= hora_fim) {
    return res.status(400).json({ message: 'Hora de início deve ser menor que a hora de fim.' });
  }

  const espaco = db.prepare('SELECT id FROM espacos WHERE id = ?').get(id_espaco);
  if (!espaco) return res.status(404).json({ message: 'Espaço não encontrado.' });

  // Validação de conflitos
  const conflitos = db.prepare(`
    SELECT * FROM reservas 
    WHERE id_espaco = ? AND data = ? AND status = 'ativa' 
    AND (
      (hora_inicio < ? AND hora_fim > ?) -- Nova reserva engolida ou sobrepõe
      OR (hora_inicio >= ? AND hora_inicio < ?)  -- Nova reserva começa no meio
      OR (hora_fim > ? AND hora_fim <= ?)    -- Nova reserva termina no meio
    )
  `).all(id_espaco, data, hora_fim, hora_inicio, hora_inicio, hora_fim, hora_inicio, hora_fim);

  // A query acima verifica qualquer sobreposição (permitindo encostar: h_fim = h_inicio)

  const temConflito = db.prepare(`
    SELECT COUNT(*) as count FROM reservas 
    WHERE id_espaco = ? AND data = ? AND status = 'ativa'
    AND hora_inicio < ? AND hora_fim > ?
  `).get(id_espaco, data, hora_fim, hora_inicio).count > 0;

  if (temConflito) {
    return res.status(409).json({ message: 'Conflito de horário. O espaço já está reservado neste período.' });
  }

  const insert = db.prepare(`
    INSERT INTO reservas (id_espaco, id_usuario, data, hora_inicio, hora_fim, finalidade) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const result = insert.run(id_espaco, req.usuario.id, data, hora_inicio, hora_fim, finalidade);
  
  const novaReserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(novaReserva);
});

// GET /api/reservas/minhas (token obrigatório)
app.get('/api/reservas/minhas', autenticarToken, (req, res) => {
  const reservas = db.prepare(`
    SELECT r.*, e.nome as espaco_nome 
    FROM reservas r
    JOIN espacos e ON r.id_espaco = e.id
    WHERE r.id_usuario = ?
    ORDER BY r.data DESC, r.hora_inicio DESC
  `).all(req.usuario.id);
  res.json(reservas);
});

// PATCH /api/reservas/:id/cancelar (token obrigatório)
app.patch('/api/reservas/:id/cancelar', autenticarToken, (req, res) => {
  const { id } = req.params;
  const reserva = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);

  if (!reserva) return res.status(404).json({ message: 'Reserva não encontrada.' });
  if (reserva.status === 'cancelada') return res.status(400).json({ message: 'Reserva já cancelada.' });

  // Só dono ou admin podem cancelar
  if (reserva.id_usuario !== req.usuario.id && req.usuario.papel !== 'Admin') {
    return res.status(403).json({ message: 'Sem permissão para cancelar esta reserva.' });
  }

  db.prepare("UPDATE reservas SET status = 'cancelada' WHERE id = ?").run(id);
  
  const reservaAtualizada = db.prepare('SELECT * FROM reservas WHERE id = ?').get(id);
  res.json(reservaAtualizada);
});

// ─── SPRINT 2 ENDPOINTS ───────────────────────────────────────────────────

// GET /api/reservas/agenda — Agenda geral (todas as reservas de uma data)
app.get('/api/reservas/agenda', autenticarToken, (req, res) => {
  const { data } = req.query;
  if (!data) return res.status(400).json({ message: 'Parâmetro "data" é obrigatório.' });

  const reservas = db.prepare(`
    SELECT r.id, r.id_espaco, e.nome as espaco_nome, r.hora_inicio, r.hora_fim, r.finalidade, u.nome as usuario_nome
    FROM reservas r
    JOIN espacos e ON r.id_espaco = e.id
    JOIN usuarios u ON r.id_usuario = u.id
    WHERE r.data = ? AND r.status = 'ativa'
    ORDER BY r.hora_inicio ASC
  `).all(data);

  res.json(reservas);
});

// POST /api/espacos — Criar espaço (Admin only)
app.post('/api/espacos', autenticarToken, (req, res) => {
  if (req.usuario.papel !== 'Admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }

  const { id, nome, tipo, capacidade, localizacao, observacoes } = req.body;

  if (!id || !nome || !tipo || !capacidade || !localizacao) {
    return res.status(400).json({ message: 'Campos obrigatórios: id, nome, tipo, capacidade, localizacao.' });
  }

  const existente = db.prepare('SELECT id FROM espacos WHERE id = ?').get(id);
  if (existente) {
    return res.status(409).json({ message: 'Já existe um espaço com este ID.' });
  }

  db.prepare(`
    INSERT INTO espacos (id, nome, tipo, capacidade, localizacao, observacoes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, nome, tipo, Number(capacidade), localizacao, observacoes || null);

  const novoEspaco = db.prepare('SELECT * FROM espacos WHERE id = ?').get(id);
  res.status(201).json(novoEspaco);
});

// PUT /api/espacos/:id — Editar espaço (Admin only)
app.put('/api/espacos/:id', autenticarToken, (req, res) => {
  if (req.usuario.papel !== 'Admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }

  const { id } = req.params;
  const espaco = db.prepare('SELECT * FROM espacos WHERE id = ?').get(id);
  if (!espaco) {
    return res.status(404).json({ message: 'Espaço não encontrado.' });
  }

  const { nome, tipo, capacidade, localizacao, observacoes } = req.body;

  if (!nome || !tipo || !capacidade || !localizacao) {
    return res.status(400).json({ message: 'Campos obrigatórios: nome, tipo, capacidade, localizacao.' });
  }

  db.prepare(`
    UPDATE espacos SET nome = ?, tipo = ?, capacidade = ?, localizacao = ?, observacoes = ?
    WHERE id = ?
  `).run(nome, tipo, Number(capacidade), localizacao, observacoes || null, id);

  const espacoAtualizado = db.prepare('SELECT * FROM espacos WHERE id = ?').get(id);
  res.json(espacoAtualizado);
});

// DELETE /api/espacos/:id — Remover espaço (Admin only)
app.delete('/api/espacos/:id', autenticarToken, (req, res) => {
  if (req.usuario.papel !== 'Admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }

  const { id } = req.params;
  const espaco = db.prepare('SELECT * FROM espacos WHERE id = ?').get(id);
  if (!espaco) {
    return res.status(404).json({ message: 'Espaço não encontrado.' });
  }

  const reservasAtivas = db.prepare(
    "SELECT COUNT(*) as count FROM reservas WHERE id_espaco = ? AND status = 'ativa'"
  ).get(id).count;

  if (reservasAtivas > 0) {
    return res.status(409).json({ message: 'Não é possível remover. Existem reservas ativas vinculadas a este espaço.' });
  }

  db.prepare('DELETE FROM espacos WHERE id = ?').run(id);
  res.json({ message: 'Espaço removido com sucesso.' });
});

// POST /api/usuarios — Cadastrar usuário (Admin only)
app.post('/api/usuarios', autenticarToken, (req, res) => {
  if (req.usuario.papel !== 'Admin') {
    return res.status(403).json({ message: 'Acesso restrito a administradores.' });
  }

  const { username, nome, senha, papel, email, status } = req.body;

  if (!username || !nome || !senha || !papel) {
    return res.status(400).json({ message: 'Campos obrigatórios: username, nome, senha, papel.' });
  }

  if (!['Aluno', 'Professor', 'Admin'].includes(papel)) {
    return res.status(400).json({ message: 'Papel deve ser Aluno, Professor ou Admin.' });
  }

  if (senha.length < 4) {
    return res.status(400).json({ message: 'A senha deve ter no mínimo 4 caracteres.' });
  }

  const existente = db.prepare('SELECT id FROM usuarios WHERE username = ?').get(username);
  if (existente) {
    return res.status(409).json({ message: 'Já existe um usuário com este username.' });
  }

  const senha_hash = bcrypt.hashSync(senha, 10);
  const statusFinal = status || 'ativo';

  db.prepare(`
    INSERT INTO usuarios (username, email, senha_hash, nome, papel, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(username, email || null, senha_hash, nome, papel, statusFinal);

  const novoUsuario = db.prepare('SELECT id, username, email, nome, papel, status FROM usuarios WHERE username = ?').get(username);
  res.status(201).json(novoUsuario);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend rodando na porta ${PORT}`);
});
