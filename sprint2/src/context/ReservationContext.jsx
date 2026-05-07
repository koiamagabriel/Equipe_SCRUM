import { createContext, useContext } from 'react';
import { apiFetch } from '../services/api';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const createReservation = async (data) => {
    try {
      const payload = {
        id_espaco: data.roomId,
        data: data.date,
        hora_inicio: data.startTime,
        hora_fim: data.endTime,
        finalidade: data.purpose,
      };
      await apiFetch('/reservas', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return { success: true };
    } catch (err) {
      if (err.status === 409 || err.status === 400) {
        return { success: false, message: err.message || 'Conflito de horário! Já existe uma reserva nesse período.' };
      }
      return { success: false, message: err.message };
    }
  };

  const cancelReservation = async (id) => {
    try {
      await apiFetch(`/reservas/${id}/cancelar`, { method: 'PATCH' });
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const getRoomReservationsForDate = async (roomId, date) => {
    try {
      const res = await apiFetch(`/reservas/disponibilidade?id_espaco=${roomId}&data=${date}`);
      return res.map(r => ({
        id: r.id,
        roomId: r.id_espaco,
        date: date,
        startTime: r.startTime,
        endTime: r.endTime,
        purpose: r.purpose,
        userName: r.userName,
        status: 'confirmada'
      }));
    } catch (err) {
      if (err.status === 404) return [];
      console.error(err);
      return [];
    }
  };

  const getUserReservations = async () => {
    try {
      const res = await apiFetch('/reservas/minhas');
      return res.map(r => ({
        id: r.id,
        roomId: r.id_espaco,
        roomName: r.espaco_nome,
        date: r.data,
        startTime: r.hora_inicio,
        endTime: r.hora_fim,
        purpose: r.finalidade,
        status: r.status === 'ativa' ? 'confirmada' : 'cancelada'
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  };

  return (
    <ReservationContext.Provider
      value={{
        createReservation,
        cancelReservation,
        getRoomReservationsForDate,
        getUserReservations,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservations() {
  return useContext(ReservationContext);
}
