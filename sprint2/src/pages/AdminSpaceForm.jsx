import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import './AdminSpaceForm.css';

const TIPOS = ['Sala de Aula', 'Laboratório', 'Auditório', 'Sala de Reunião'];

export default function AdminSpaceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    id: '',
    nome: '',
    tipo: 'Sala de Aula',
    capacidade: '',
    localizacao: '',
    observacoes: '',
  });
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect non-admin
  if (currentUser?.papel !== 'Admin') {
    return <Navigate to="/" replace />;
  }

  useEffect(() => {
    if (!isEdit) return;
    apiFetch(`/espacos/${id}`)
      .then(r => {
        setForm({
          id: r.id,
          nome: r.nome,
          tipo: r.tipo,
          capacidade: String(r.capacidade),
          localizacao: r.localizacao,
          observacoes: r.observacoes || '',
        });
      })
      .catch(err => {
        setError(err.message || 'Erro ao carregar espaço.');
      })
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!isEdit && !form.id.trim()) {
      setError('O ID do espaço é obrigatório.');
      return;
    }
    if (!form.nome.trim()) { setError('O nome é obrigatório.'); return; }
    if (!form.tipo) { setError('O tipo é obrigatório.'); return; }
    if (!form.capacidade || Number(form.capacidade) <= 0) {
      setError('A capacidade deve ser um número maior que zero.');
      return;
    }
    if (!form.localizacao.trim()) { setError('A localização é obrigatória.'); return; }

    setSubmitting(true);
    try {
      if (isEdit) {
        await apiFetch(`/espacos/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            nome: form.nome.trim(),
            tipo: form.tipo,
            capacidade: Number(form.capacidade),
            localizacao: form.localizacao.trim(),
            observacoes: form.observacoes.trim() || null,
          }),
        });
        setSuccess('Espaço atualizado com sucesso!');
      } else {
        await apiFetch('/espacos', {
          method: 'POST',
          body: JSON.stringify({
            id: form.id.trim(),
            nome: form.nome.trim(),
            tipo: form.tipo,
            capacidade: Number(form.capacidade),
            localizacao: form.localizacao.trim(),
            observacoes: form.observacoes.trim() || null,
          }),
        });
        setSuccess('Espaço criado com sucesso! Redirecionando...');
        setTimeout(() => navigate('/'), 1500);
      }
    } catch (err) {
      setError(err.message || 'Erro ao salvar espaço.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Carregando dados do espaço...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <button className="back-btn btn btn-ghost btn-sm fade-in" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        <div className="admin-form-header fade-in">
          <div>
            <h1>{isEdit ? 'Editar Espaço' : 'Novo Espaço'}</h1>
            <p>{isEdit ? `Editando o espaço ${id}` : 'Cadastre um novo espaço no sistema.'}</p>
          </div>
        </div>

        <div className="card admin-form-card fade-in">
          <form className="admin-form" onSubmit={handleSubmit}>
            {/* ID — only in create mode */}
            {!isEdit && (
              <div className="form-group">
                <label className="form-label" htmlFor="space-id">ID do Espaço *</label>
                <input
                  id="space-id"
                  name="id"
                  type="text"
                  className="form-input"
                  placeholder="Ex: B301"
                  value={form.id}
                  onChange={handleChange}
                />
                <span className="form-hint">Identificador único (não pode ser alterado depois)</span>
              </div>
            )}

            {isEdit && (
              <div className="form-group">
                <label className="form-label">ID do Espaço</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.id}
                  disabled
                  style={{ opacity: 0.6, cursor: 'not-allowed' }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="space-nome">Nome *</label>
              <input
                id="space-nome"
                name="nome"
                type="text"
                className="form-input"
                placeholder="Ex: Sala B301"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="space-tipo">Tipo *</label>
                <select
                  id="space-tipo"
                  name="tipo"
                  className="form-select"
                  value={form.tipo}
                  onChange={handleChange}
                >
                  {TIPOS.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="space-capacidade">Capacidade *</label>
                <input
                  id="space-capacidade"
                  name="capacidade"
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="Ex: 40"
                  value={form.capacidade}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="space-localizacao">Localização *</label>
              <input
                id="space-localizacao"
                name="localizacao"
                type="text"
                className="form-input"
                placeholder="Ex: Bloco B, 3º Andar"
                value={form.localizacao}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="space-observacoes">Observações</label>
              <textarea
                id="space-observacoes"
                name="observacoes"
                className="form-textarea"
                placeholder="Informações adicionais sobre o espaço (opcional)"
                value={form.observacoes}
                onChange={handleChange}
              />
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="admin-form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Espaço'}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
