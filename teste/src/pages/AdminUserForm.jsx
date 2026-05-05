import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import './AdminSpaceForm.css';
import './AdminUserForm.css';

const PAPEIS = ['Aluno', 'Professor', 'Admin'];

export default function AdminUserForm() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [form, setForm] = useState({
    username: '',
    nome: '',
    senha: '',
    papel: 'Aluno',
    email: '',
    status: 'ativo',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (currentUser?.papel !== 'Admin') {
    return <Navigate to="/" replace />;
  }

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

    if (!form.username.trim()) { setError('O username é obrigatório.'); return; }
    if (!form.nome.trim()) { setError('O nome é obrigatório.'); return; }
    if (!form.senha || form.senha.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (!form.papel) { setError('O papel é obrigatório.'); return; }

    setSubmitting(true);
    try {
      await apiFetch('/usuarios', {
        method: 'POST',
        body: JSON.stringify({
          username: form.username.trim(),
          nome: form.nome.trim(),
          senha: form.senha,
          papel: form.papel,
          email: form.email.trim() || null,
          status: form.status,
        }),
      });
      setSuccess('Usuário cadastrado com sucesso!');
      setForm({ username: '', nome: '', senha: '', papel: 'Aluno', email: '', status: 'ativo' });
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar usuário.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1>Cadastrar Usuário</h1>
            <p>Adicione um novo usuário ao sistema.</p>
          </div>
        </div>

        <div className="card admin-form-card admin-user-form-card fade-in">
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="user-username">Username *</label>
                <input
                  id="user-username"
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Ex: joao.silva"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="user-nome">Nome Completo *</label>
                <input
                  id="user-nome"
                  name="nome"
                  type="text"
                  className="form-input"
                  placeholder="Ex: João da Silva"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-email">Email</label>
              <input
                id="user-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="email@exemplo.com (opcional)"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="user-senha">Senha *</label>
              <input
                id="user-senha"
                name="senha"
                type="password"
                className="form-input"
                placeholder="Mínimo 4 caracteres"
                value={form.senha}
                onChange={handleChange}
              />
              <span className="password-hint">Mínimo de 4 caracteres</span>
            </div>

            <div className="admin-form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="user-papel">Papel *</label>
                <select
                  id="user-papel"
                  name="papel"
                  className="form-select"
                  value={form.papel}
                  onChange={handleChange}
                >
                  {PAPEIS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="user-status">Status</label>
                <select
                  id="user-status"
                  name="status"
                  className="form-select"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            {error && <div className="alert alert-error">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Cadastrando...' : 'Cadastrar Usuário'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
