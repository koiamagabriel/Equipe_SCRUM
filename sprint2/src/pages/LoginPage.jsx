import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const { login, currentUser, error, setError } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) navigate('/', { replace: true });
    return () => setError('');
  }, [currentUser]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(async () => {
      const ok = await login(username.trim(), password);
      setLoading(false);
      if (ok) navigate('/');
    }, 500);
  };

  const demoUsers = [
    { label: 'Aluno', username: 'aluno', password: '1234' },
    { label: 'Professor', username: 'professor', password: '1234' },
  ];

  return (
    <div className="login-page">
      <div className="login-card card fade-in">
        {/* Logo */}
        <div className="login-brand">
          <div className="login-logo">FEI</div>
          <div>
            <h1 className="login-title">Reservas FEI</h1>
            <p className="login-desc">Sistema de Reserva de Salas e Laboratórios</p>
          </div>
        </div>

        <hr className="divider" />

        {/* Form */}
        <form id="login-form" className="login-form" onSubmit={handleSubmit} autoComplete="on">
          {error && (
            <div className="alert alert-error slide-down" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="login-username">Usuário</label>
            <input
              id="login-username"
              type="text"
              className="form-input"
              placeholder="Digite seu usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Senha</label>
            <div className="password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Digite sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            id="btn-login"
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Entrar
              </>
            )}
          </button>
        </form>

        {/* Demo shortcuts */}
        <div className="demo-section">
          <p className="demo-label">Acesso rápido para demonstração:</p>
          <div className="demo-buttons">
            {demoUsers.map((u) => (
              <button
                key={u.username}
                id={`demo-${u.username}`}
                className="btn btn-outline btn-sm"
                onClick={() => { setUsername(u.username); setPassword(u.password); }}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
