import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import './GeneralAgenda.css';
import './RoomAgenda.css';

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split('T')[0];
}

const SPACE_ICONS = {
  'Sala de Aula':    '🎓',
  'Laboratório':     '🔬',
  'Auditório':       '🎤',
  'Sala de Reunião': '💼',
};

export default function GeneralAgenda() {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/reservas/agenda?data=${selectedDate}`)
      .then(res => setReservations(res))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [selectedDate]);

  const uniqueSpaces = [...new Set(reservations.map(r => r.espaco_nome))].length;

  return (
    <main className="page">
      <div className="container">
        <button className="back-btn btn btn-ghost btn-sm fade-in" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        <div className="general-agenda-header fade-in">
          <div>
            <h1>Agenda Geral</h1>
            <p>Visualize todas as reservas de todos os espaços.</p>
          </div>
        </div>

        {/* Date nav */}
        <div className="card date-nav-card fade-in">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            aria-label="Dia anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="date-nav-center">
            <input
              id="general-agenda-date"
              type="date"
              className="form-input date-input-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <span className="date-label-formatted">{formatDate(selectedDate)}</span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            aria-label="Próximo dia"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        </div>

        {/* Summary */}
        {!loading && reservations.length > 0 && (
          <div className="card general-agenda-summary fade-in">
            <div className="summary-stat">
              <strong>{reservations.length}</strong> reserva{reservations.length !== 1 ? 's' : ''}
            </div>
            <div className="summary-stat">
              <strong>{uniqueSpaces}</strong> espaço{uniqueSpaces !== 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* Timeline */}
        {loading ? (
          <div className="card agenda-empty fade-in">
            <p>Carregando reservas...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card agenda-empty fade-in">
            <span className="agenda-empty-icon">📅</span>
            <h3>Nenhuma reserva neste dia</h3>
            <p>Não há reservas ativas em nenhum espaço nesta data.</p>
          </div>
        ) : (
          <div className="general-agenda-list fade-in">
            {reservations.map((res) => (
              <div key={res.id} className="general-agenda-item card">
                <div className="agenda-time-col">
                  <span className="agenda-start">{res.hora_inicio}</span>
                  <div className="agenda-time-line" />
                  <span className="agenda-end">{res.hora_fim}</span>
                </div>
                <div className="agenda-content">
                  <div className="general-agenda-space">
                    <span className="general-agenda-space-icon">
                      {SPACE_ICONS[res.tipo] || '🏫'}
                    </span>
                    {res.espaco_nome}
                  </div>
                  <div className="agenda-purpose">{res.finalidade}</div>
                  <div className="agenda-meta">
                    <span className="agenda-owner">
                      <div className="agenda-avatar">{res.usuario_nome?.[0]}</div>
                      {res.usuario_nome}
                    </span>
                    <span className="badge badge-green">Confirmada</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
