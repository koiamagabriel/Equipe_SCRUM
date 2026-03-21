import { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('fei_token');
    if (token) {
      apiFetch('/auth/me')
        .then(user => {
          const normalizedUser = {
            ...user,
            name: user.nome,
            role: user.papel
          };
          setCurrentUser(normalizedUser);
        })
        .catch(() => localStorage.removeItem('fei_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      localStorage.setItem('fei_token', data.token);
      
      const user = await apiFetch('/auth/me');
      const normalizedUser = {
        ...user,
        name: user.nome,
        role: user.papel
      };
      setCurrentUser(normalizedUser);
      setError('');
      return true;
    } catch (err) {
      setError(err.message || 'Usuário ou senha inválidos.');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('fei_token');
    setCurrentUser(null);
    setError('');
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, error, setError, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
