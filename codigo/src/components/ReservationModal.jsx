import { useState, useEffect } from 'react';
import { useReservations } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';
import { ROOMS, TIME_SLOTS } from '../data/mockData';
import './ReservationModal.css';

export default function ReservationModal({ room, initialDate, initialStartTime, onClose, onSuccess }) {
  const { createReservation } = useReservations();
  const { currentUser } = useAuth();

  const [date, setDate] = useState(initialDate || '');
  const [startTime, setStartTime] = useState(initialStartTime || '');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Build end-time options (must be > startTime)
  const endTimeOptions = TIME_SLOTS.filter((t) => t > startTime);

  // Auto-select next slot as endTime when startTime changes
  useEffect(() => {
    if (startTime) {
      const next = endTimeOptions[0] ?? '';
      setEndTime(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime]);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime || !purpose.trim()) {
      setError('Preencha todos os campos.');
      return;
    }

    if (date < todayStr) {
      setError('Não é possível reservar datas passadas.');
      return;
    }

    if (startTime >= endTime) {
      setError('O horário de início deve ser anterior ao horário de fim.');
      return;
    }

    setLoading(true);

    setTimeout(async () => {
      const result = await createReservation({
        roomId: room.id,
        userId: currentUser.id,
        userName: currentUser.name,
        date,
        startTime,
        endTime,
        purpose: purpose.trim(),
      });

      setLoading(false);

      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.message);
      }
    }, 400);
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box fade-in-scale">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Nova Reserva</h2>
            <p className="modal-subtitle">{room.name}</p>
          </div>
          <button className="modal-close btn btn-ghost" onClick={onClose} aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <hr className="divider" style={{margin: '0'}} />

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error" role="alert">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="res-room">Sala</label>
              <input id="res-room" className="form-input" value={room.name} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="res-date">Data</label>
              <input
                id="res-date"
                type="date"
                className="form-input"
                value={date}
                min={todayStr}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="res-start">Horário início</label>
              <select
                id="res-start"
                className="form-input"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              >
                <option value="">Selecione</option>
                {TIME_SLOTS.slice(0, -1).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="res-end">Horário fim</label>
              <select
                id="res-end"
                className="form-input"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                disabled={!startTime}
              >
                <option value="">Selecione</option>
                {endTimeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="res-purpose">Finalidade da reserva</label>
            <textarea
              id="res-purpose"
              className="form-input"
              style={{ resize: 'vertical', minHeight: '80px' }}
              placeholder="Ex: Aula de recuperação, Estudo em grupo, Reunião de projeto..."
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              required
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>
              Cancelar
            </button>
            <button
              id="btn-confirm-reservation"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Confirmando...' : 'Confirmar reserva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
