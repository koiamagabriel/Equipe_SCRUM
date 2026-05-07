import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import RoomCard from '../components/RoomCard';
import './RoomList.css';

const TYPES = ['Todos', 'Sala de Aula', 'Laboratório', 'Auditório', 'Sala de Reunião'];

export default function RoomList() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const qs = typeFilter !== 'Todos' ? `?tipo=${encodeURIComponent(typeFilter)}` : '';
    apiFetch(`/espacos${qs}`)
      .then(data => {
        const mapped = data.map(r => ({
          id: r.id,
          name: r.nome,
          type: r.tipo,
          capacity: r.capacidade,
          location: r.localizacao,
          notes: r.observacoes,
          building: r.localizacao.split(', ')[0] || r.localizacao,
          floor: r.localizacao.split(', ')[1] || '',
          features: r.observacoes ? [r.observacoes] : []
        }));
        setRooms(mapped);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [typeFilter]);

  const filtered = rooms.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.location.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  return (
    <main className="page">
      <div className="container">
        {/* Page Header */}
        <div className="rooms-header fade-in">
          <div>
            <h1>Salas e Laboratórios</h1>
            <p>Encontre e reserve o espaço ideal para suas atividades.</p>
          </div>
          <span className="rooms-count badge badge-blue">{filtered.length} espaço{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Filters */}
        <div className="rooms-filters fade-in">
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              id="search-rooms"
              type="text"
              className="form-input search-input"
              placeholder="Buscar por nome ou localização..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')} aria-label="Limpar busca">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </div>

          <div className="type-filters">
            {TYPES.map((t) => (
              <button
                key={t}
                id={`filter-${t.replace(/\\s+/g, '-').toLowerCase()}`}
                className={`filter-chip ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="empty-state fade-in" style={{ padding: '3rem' }}>
            <p>Carregando espaços...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid-rooms">
            {filtered.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="empty-state fade-in">
            <div className="empty-icon">🔍</div>
            <h3>Nenhuma sala encontrada</h3>
            <p>Tente ajustar os filtros ou o termo de busca.</p>
            <button className="btn btn-outline" onClick={() => { setSearch(''); setTypeFilter('Todos'); }}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
