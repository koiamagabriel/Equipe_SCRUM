import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = currentUser?.papel === 'Admin';

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <NavLink to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="navbar-logo">FEI</span>
          <span className="navbar-title">Reservas</span>
        </NavLink>

        {/* Desktop Links */}
        <div className="navbar-links">
          <NavLink to="/" end className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            Salas
          </NavLink>
          <NavLink to="/minhas-reservas" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            Minhas Reservas
          </NavLink>
          <NavLink to="/agenda-geral" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
            Agenda Geral
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/espacos/novo" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                Novo Espaço
              </NavLink>
              <NavLink to="/admin/usuarios/novo" className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}>
                Novo Usuário
              </NavLink>
            </>
          )}
        </div>

        {/* User pill */}
        <div className="navbar-user">
          <div className="user-pill">
            <div className="user-avatar">{currentUser?.nome?.[0]?.toUpperCase()}</div>
            <span className="user-name">{currentUser?.nome}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} title="Sair">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair
          </button>
        </div>

        {/* Hamburger */}
        <button
          className={`hamburger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-menu slide-down">
          <NavLink to="/" end className="mobile-link" onClick={() => setMenuOpen(false)}>Salas</NavLink>
          <NavLink to="/minhas-reservas" className="mobile-link" onClick={() => setMenuOpen(false)}>Minhas Reservas</NavLink>
          <NavLink to="/agenda-geral" className="mobile-link" onClick={() => setMenuOpen(false)}>Agenda Geral</NavLink>
          {isAdmin && (
            <>
              <hr className="divider" style={{margin: '.5rem 0'}} />
              <NavLink to="/admin/espacos/novo" className="mobile-link" onClick={() => setMenuOpen(false)}>Novo Espaço</NavLink>
              <NavLink to="/admin/usuarios/novo" className="mobile-link" onClick={() => setMenuOpen(false)}>Novo Usuário</NavLink>
            </>
          )}
          <hr className="divider" style={{margin: '.5rem 0'}} />
          <div className="mobile-user">
            <span>{currentUser?.nome} · {currentUser?.papel}</span>
            <button className="btn btn-ghost btn-sm" onClick={() => { handleLogout(); setMenuOpen(false); }}>Sair</button>
          </div>
        </div>
      )}
    </nav>
  );
}
