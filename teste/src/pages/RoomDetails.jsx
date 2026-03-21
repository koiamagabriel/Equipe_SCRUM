import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import './RoomDetails.css';

const TYPE_ICONS = {
  'Sala de Aula':    '🎓',
  'Laboratório':     '🔬',
  'Auditório':       '🎤',
  'Sala de Reunião': '💼',
};
const TYPE_BADGE = {
  'Sala de Aula':    'badge-blue',
  'Laboratório':     'badge-green',
  'Auditório':       'badge-yellow',
  'Sala de Reunião': 'badge-gray',
};

export default function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/espacos/${id}`)
      .then(r => {
        setRoom({
          id: r.id,
          name: r.nome,
          type: r.tipo,
          capacity: r.capacidade,
          location: r.localizacao,
          notes: r.observacoes,
          building: r.localizacao.split(', ')[0] || r.localizacao,
          floor: r.localizacao.split(', ')[1] || '',
          features: r.observacoes ? [r.observacoes] : []
        });
      })
      .catch(err => {
        console.error(err);
        setRoom(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <main className="page">
        <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Carregando detalhes...</p>
        </div>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state fade-in">
            <div className="empty-icon">🏫</div>
            <h3>Sala não encontrada</h3>
            <p>A sala que você procura não existe ou foi removida.</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar para listagem</button>
          </div>
        </div>
      </main>
    );
  }

  const icon = TYPE_ICONS[room.type] ?? '🏫';
  const badgeClass = TYPE_BADGE[room.type] ?? 'badge-gray';

  return (
    <main className="page">
      <div className="container">
        {/* Back nav */}
        <button className="back-btn btn btn-ghost btn-sm fade-in" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        {/* Hero card */}
        <div className="detail-hero card fade-in">
          <div className="detail-icon">{icon}</div>
          <div className="detail-hero-content">
            <div className="detail-hero-top">
              <h1 className="detail-name">{room.name}</h1>
              <span className={`badge ${badgeClass}`}>{room.type}</span>
            </div>
            <p className="detail-notes">{room.notes}</p>
          </div>
        </div>

        <div className="detail-grid">
          {/* Info card */}
          <div className="card detail-info">
            <h2 className="section-title">Informações</h2>
            <div className="info-list">
              <div className="info-item">
                <span className="info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                </span>
                <div>
                  <span className="info-label">Capacidade</span>
                  <span className="info-value">{room.capacity} pessoas</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                </span>
                <div>
                  <span className="info-label">Localização</span>
                  <span className="info-value">{room.location}</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </span>
                <div>
                  <span className="info-label">Prédio / Andar</span>
                  <span className="info-value">{room.building} · {room.floor}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="features-section">
              <h4 className="features-title">Recursos disponíveis</h4>
              <div className="features-list">
                {room.features.map((f, i) => (
                  <span key={i} className="feature-tag">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* CTA card */}
          <div className="card detail-cta">
            <div className="cta-content">
              <div className="cta-icon">📅</div>
              <h3>Reservar este espaço</h3>
              <p>Verifique os horários disponíveis e faça sua reserva de forma rápida e simples.</p>
              <button
                id="btn-see-availability"
                className="btn btn-primary btn-full"
                onClick={() => navigate(`/salas/${room.id}/disponibilidade`)}
              >
                Ver disponibilidade
              </button>
              <button
                id="btn-see-agenda"
                className="btn btn-outline btn-full"
                onClick={() => navigate(`/salas/${room.id}/agenda`)}
              >
                Ver agenda completa
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
