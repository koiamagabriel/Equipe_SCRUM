const BASE_URL = 'http://localhost:3001/api';

function getToken() { return localStorage.getItem('fei_token'); }

function headers() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw { status: res.status, message: err.message || 'Erro desconhecido' };
  }
  return res.json();
}
