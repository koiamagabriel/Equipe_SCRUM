import { useMemo } from 'react';
import { TIME_SLOTS } from '../data/mockData';
import './ScheduleGrid.css';

function getSlotStatus(slot, reservations, selectedDate) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const currentHour = now.getHours();
  const slotHour = parseInt(slot.split(':')[0], 10);

  // Passed slot
  if (selectedDate < todayStr || (selectedDate === todayStr && slotHour <= currentHour)) {
    return 'past';
  }

  // Busy: slot is inside a confirmed reservation
  const busy = reservations.some((r) => {
    return r.status !== 'cancelada' && slot >= r.startTime && slot < r.endTime;
  });

  return busy ? 'busy' : 'available';
}

export default function ScheduleGrid({ reservations, selectedDate, onSlotClick }) {
  const slots = useMemo(() => {
    return TIME_SLOTS.slice(0, -1).map((slot, idx) => {
      const status = getSlotStatus(slot, reservations, selectedDate);
      const endTime = TIME_SLOTS[idx + 1];

      // Find reservation in this slot
      const res = reservations.find(
        (r) => r.status !== 'cancelada' && slot >= r.startTime && slot < r.endTime
      );

      return { slot, endTime, status, reservation: res };
    });
  }, [reservations, selectedDate]);

  return (
    <div className="schedule-grid">
      <div className="schedule-legend">
        <span className="legend-item"><span className="legend-dot legend-available" />Disponível</span>
        <span className="legend-item"><span className="legend-dot legend-busy" />Ocupado</span>
        <span className="legend-item"><span className="legend-dot legend-past" />Passado</span>
      </div>

      <div className="schedule-slots">
        {slots.map(({ slot, endTime, status, reservation }) => (
          <div
            key={slot}
            className={`schedule-slot schedule-slot-${status} ${status === 'available' ? 'slot-clickable' : ''}`}
            role={status === 'available' ? 'button' : undefined}
            tabIndex={status === 'available' ? 0 : undefined}
            onClick={() => status === 'available' && onSlotClick?.(slot, endTime)}
            onKeyDown={(e) => {
              if (status === 'available' && (e.key === 'Enter' || e.key === ' ')) {
                onSlotClick?.(slot, endTime);
              }
            }}
            title={
              status === 'available'
                ? `Clique para reservar ${slot}–${endTime}`
                : status === 'busy'
                ? `Ocupado: ${reservation?.purpose}`
                : 'Horário passado'
            }
          >
            <span className="slot-time">{slot}</span>
            <div className="slot-content">
              {status === 'available' && (
                <span className="slot-label available">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Disponível — clique para reservar
                </span>
              )}
              {status === 'busy' && reservation && (
                <div className="slot-reservation">
                  <span className="slot-label busy">{reservation.purpose}</span>
                  <span className="slot-owner">{reservation.userName} · {reservation.startTime}–{reservation.endTime}</span>
                </div>
              )}
              {status === 'past' && (
                <span className="slot-label past">Passado</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
