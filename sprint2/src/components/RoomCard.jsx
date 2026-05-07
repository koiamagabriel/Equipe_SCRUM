import { useNavigate } from 'react-router-dom';
import './RoomCard.css';

const TYPE_ICONS = {
  'Sala de Aula':   '🎓',
  'Laboratório':    '🔬',
  'Auditório':      '🎤',
  'Sala de Reunião':'💼',
};

const TYPE_BADGE = {
  'Sala de Aula':    'badge-blue',
  'Laboratório':     'badge-green',
  'Auditório':       'badge-yellow',
  'Sala de Reunião': 'badge-gray',
};

export default function RoomCard({ room }) {
  const navigate = useNavigate();
  const icon = TYPE_ICONS[room.type] ?? '🏫';
  const badgeClass = TYPE_BADGE[room.type] ?? 'badge-gray';

  return (
    <article className="room-card card fade-in" role="article">
      <div className="room-card-icon">{icon}</div>
      <div className="room-card-body">
        <div className="room-card-header">
          <h3 className="room-card-name">{room.name}</h3>
          <span className={`badge ${badgeClass}`}>{room.type}</span>
        </div>
        <div className="room-card-meta">
          <span className="room-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {room.capacity} pessoas
          </span>
          <span className="room-meta-item">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {room.location}
          </span>
        </div>
        <div className="room-card-actions">
          <button
            id={`btn-details-${room.id}`}
            className="btn btn-outline btn-sm"
            onClick={() => navigate(`/salas/${room.id}`)}
          >
            Ver detalhes
          </button>
          <button
            id={`btn-avail-${room.id}`}
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/salas/${room.id}/disponibilidade`)}
          >
            Ver disponibilidade
          </button>
        </div>
      </div>
    </article>
  );
}
