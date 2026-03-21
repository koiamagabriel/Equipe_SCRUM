import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useReservations } from '../context/ReservationContext';
import './MyReservations.css';

const STATUS_MAP = {
  confirmada: { label: 'Confirmada', badgeClass: 'badge-green' },
  cancelada:  { label: 'Cancelada',  badgeClass: 'badge-red' },
  pendente:   { label: 'Pendente',   badgeClass: 'badge-yellow' },
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  });
}

export default function MyReservations() {
  const { currentUser } = useAuth();
  const { getUserReservations, cancelReservation } = useReservations();
  const navigate = useNavigate();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = () => {
    setLoading(true);
    getUserReservations()
      .then(res => setReservations(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReservations();
  }, [getUserReservations]);

  const handleCancel = async (id) => {
    await cancelReservation(id);
    loadReservations();
  };

  if (loading) {
    return (
      <main className="page">
        <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Carregando reservas...</p>
        </div>
      </main>
    );
  }

  const active   = reservations.filter((r) => r.status === 'confirmada');
  const canceled = reservations.filter((r) => r.status === 'cancelada');

  return (
    <main className="page">
      <div className="container">
        <div className="myres-header fade-in">
          <div>
            <h1>Minhas Reservas</h1>
            <p>Gerencie suas reservas de salas e laboratórios.</p>
          </div>
          <button
            id="btn-new-reservation"
            className="btn btn-primary"
            onClick={() => navigate('/')}
          >
            + Nova reserva
          </button>
        </div>

        {reservations.length === 0 ? (
          <div className="empty-state fade-in">
            <div className="empty-icon">📭</div>
            <h3>Nenhuma reserva ainda</h3>
            <p>Você ainda não fez nenhuma reserva. Explore as salas disponíveis!</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Ver salas disponíveis
            </button>
          </div>
        ) : (
          <>
            {/* Active */}
            {active.length > 0 && (
              <section className="res-section fade-in">
                <h2 className="res-section-title">
                  Ativas
                  <span className="badge badge-blue">{active.length}</span>
                </h2>
                <div className="res-list">
                  {active.map((res) => {
                    const { badgeClass, label } = STATUS_MAP[res.status] ?? {};
                    const isToday = res.date === new Date().toISOString().split('T')[0];
                    return (
                      <div key={res.id} className="res-card card">
                        <div className="res-card-left">
                          <div className="res-room-name">
                            {res.roomName ?? res.roomId}
                            {isToday && <span className="badge badge-yellow" style={{marginLeft: '.5rem'}}>Hoje</span>}
                          </div>
                          <div className="res-meta">
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                              </svg>
                              {formatDate(res.date)}
                            </span>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {res.startTime} – {res.endTime}
                            </span>
                            <span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                              </svg>
                              {res.purpose}
                            </span>
                          </div>
                        </div>
                        <div className="res-card-right">
                          <span className={`badge ${badgeClass}`}>{label}</span>
                          <div className="res-actions">
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() => navigate(`/salas/${res.roomId}/disponibilidade`)}
                            >
                              Ver sala
                            </button>
                            <button
                              id={`btn-cancel-${res.id}`}
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(res.id)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Canceled */}
            {canceled.length > 0 && (
              <section className="res-section fade-in">
                <h2 className="res-section-title">
                  Canceladas
                  <span className="badge badge-gray">{canceled.length}</span>
                </h2>
                <div className="res-list">
                  {canceled.map((res) => {
                    const { badgeClass, label } = STATUS_MAP[res.status] ?? {};
                    return (
                      <div key={res.id} className="res-card card res-card-canceled">
                        <div className="res-card-left">
                          <div className="res-room-name">{res.roomName ?? res.roomId}</div>
                          <div className="res-meta">
                            <span>{formatDate(res.date)}</span>
                            <span>{res.startTime} – {res.endTime}</span>
                            <span>{res.purpose}</span>
                          </div>
                        </div>
                        <div className="res-card-right">
                          <span className={`badge ${badgeClass}`}>{label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}
