import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useReservations } from '../context/ReservationContext';
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

export default function RoomAgenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoomReservationsForDate } = useReservations();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [loadingRes, setLoadingRes] = useState(true);

  useEffect(() => {
    apiFetch(`/espacos/${id}`)
      .then(r => setRoom({ id: r.id, name: r.nome }))
      .catch(() => setRoom(null))
      .finally(() => setLoadingRoom(false));
  }, [id]);

  useEffect(() => {
    if (!room) return;
    setLoadingRes(true);
    getRoomReservationsForDate(id, selectedDate)
      .then(res => setReservations(res))
      .catch(() => setReservations([]))
      .finally(() => setLoadingRes(false));
  }, [id, selectedDate, room, getRoomReservationsForDate]);

  if (loadingRoom) {
    return (
      <main className="page">
        <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Carregando agenda...</p>
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
            <button className="btn btn-primary" onClick={() => navigate('/')}>Voltar</button>
          </div>
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

        <div className="agenda-header fade-in">
          <div>
            <h1>Agenda — {room.name}</h1>
            <p>Visualize todas as reservas desta sala.</p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate(`/salas/${room.id}/disponibilidade`)}
          >
            + Fazer reserva
          </button>
        </div>

        {/* Date nav */}
        <div className="card date-nav-card fade-in">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            disabled={selectedDate <= todayStr}
            aria-label="Dia anterior"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="date-nav-center">
            <input
              id="agenda-date"
              type="date"
              className="form-input date-input-sm"
              value={selectedDate}
              min={todayStr}
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

        {/* Timeline */}
        {loadingRes ? (
          <div className="card agenda-empty fade-in">
            <p>Carregando reservas...</p>
          </div>
        ) : reservations.length === 0 ? (
          <div className="card agenda-empty fade-in">
            <span className="agenda-empty-icon">📅</span>
            <h3>Nenhuma reserva neste dia</h3>
            <p>Esta sala está completamente livre nesta data.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/salas/${room.id}/disponibilidade?date=${selectedDate}`)}
            >
              Reservar um horário
            </button>
          </div>
        ) : (
          <div className="agenda-list fade-in">
            {reservations.map((res) => (
              <div key={res.id} className="agenda-item card">
                <div className="agenda-time-col">
                  <span className="agenda-start">{res.startTime}</span>
                  <div className="agenda-time-line" />
                  <span className="agenda-end">{res.endTime}</span>
                </div>
                <div className="agenda-content">
                  <div className="agenda-purpose">{res.purpose}</div>
                  <div className="agenda-meta">
                    <span className="agenda-owner">
                      <div className="agenda-avatar">{res.userName?.[0]}</div>
                      {res.userName}
                    </span>
                    <span className={`badge badge-green`}>Confirmada</span>
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
