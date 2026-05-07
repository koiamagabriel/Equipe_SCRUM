import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../services/api';
import { useReservations } from '../context/ReservationContext';
import ScheduleGrid from '../components/ScheduleGrid';
import ReservationModal from '../components/ReservationModal';
import './Availability.css';

export default function Availability() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRoomReservationsForDate } = useReservations();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [modalSlot, setModalSlot] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const [room, setRoom] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch(`/espacos/${id}`)
      .then(r => setRoom({ id: r.id, name: r.nome, capacity: r.capacidade, location: r.localizacao }))
      .catch(() => setRoom(null));
  }, [id]);

  useEffect(() => {
    if (!room) return;
    setLoading(true);
    getRoomReservationsForDate(id, selectedDate)
      .then(res => setReservations(res))
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, [id, selectedDate, room, getRoomReservationsForDate]);

  const handleSlotClick = (startTime, endTime) => {
    setSuccessMsg('');
    setModalSlot({ startTime, endTime });
  };

  const handleModalSuccess = () => {
    setModalSlot(null);
    setSuccessMsg('✅ Reserva confirmada com sucesso!');
    setTimeout(() => setSuccessMsg(''), 4000);
    // Refresh
    getRoomReservationsForDate(id, selectedDate).then(setReservations);
  };

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (!room && !loading) {
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
        {/* Back */}
        <button className="back-btn btn btn-ghost btn-sm fade-in" onClick={() => navigate(-1)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Voltar
        </button>

        {room ? (
          <>
            <div className="avail-header fade-in">
              <div>
                <h1>Disponibilidade</h1>
                <p>
                  <span className="avail-room-name">{room.name}</span>
                  {' · '}
                  {room.location}
                </p>
              </div>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate(`/salas/${room.id}/agenda`)}
              >
                📋 Ver agenda completa
              </button>
            </div>

            {successMsg && (
              <div className="alert alert-success slide-down">
                {successMsg}
              </div>
            )}

            <div className="card date-picker-card fade-in">
              <label className="form-label" htmlFor="avail-date">Selecione a data</label>
              <div className="date-picker-row">
                <input
                  id="avail-date"
                  type="date"
                  className="form-input date-input"
                  value={selectedDate}
                  min={todayStr}
                  onChange={(e) => { setSelectedDate(e.target.value); setSuccessMsg(''); }}
                />
                <span className="date-formatted">{formatDate(selectedDate)}</span>
              </div>
            </div>

            <div className="avail-stats fade-in">
              <div className="stat-card card">
                <span className="stat-value">{loading ? '-' : 14 - reservations.length}</span>
                <span className="stat-label">Horários livres</span>
              </div>
              <div className="stat-card card">
                <span className="stat-value">{loading ? '-' : reservations.length}</span>
                <span className="stat-label">Horários ocupados</span>
              </div>
              <div className="stat-card card">
                <span className="stat-value">{room.capacity}</span>
                <span className="stat-label">Capacidade</span>
              </div>
            </div>

            <div className="card avail-schedule-card fade-in">
              <h2 className="section-title" style={{padding: '1.25rem 1.5rem .5rem'}}>
                Grade de Horários
              </h2>
              <div style={{padding: '0 1.5rem 1.5rem'}}>
                {loading ? <p>Carregando disponibilidade...</p> : (
                  <ScheduleGrid
                    reservations={reservations}
                    selectedDate={selectedDate}
                    onSlotClick={handleSlotClick}
                  />
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Carregando sala...</p>
        )}
      </div>

      {modalSlot && room && (
        <ReservationModal
          room={room}
          initialDate={selectedDate}
          initialStartTime={modalSlot.startTime}
          onClose={() => setModalSlot(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </main>
  );
}
