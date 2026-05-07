import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ReservationProvider } from './context/ReservationContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RoomList from './pages/RoomList';
import RoomDetails from './pages/RoomDetails';
import Availability from './pages/Availability';
import MyReservations from './pages/MyReservations';
import RoomAgenda from './pages/RoomAgenda';
import GeneralAgenda from './pages/GeneralAgenda';
import AdminSpaceForm from './pages/AdminSpaceForm';
import AdminUserForm from './pages/AdminUserForm';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ReservationProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <Routes>
                      <Route path="/"                          element={<RoomList />} />
                      <Route path="/salas/:id"                 element={<RoomDetails />} />
                      <Route path="/salas/:id/disponibilidade" element={<Availability />} />
                      <Route path="/salas/:id/agenda"          element={<RoomAgenda />} />
                      <Route path="/minhas-reservas"           element={<MyReservations />} />
                      <Route path="/agenda-geral"              element={<GeneralAgenda />} />
                      <Route path="/admin/espacos/novo"        element={<AdminSpaceForm />} />
                      <Route path="/admin/espacos/:id/editar"  element={<AdminSpaceForm />} />
                      <Route path="/admin/usuarios/novo"       element={<AdminUserForm />} />
                      <Route path="*"                          element={<Navigate to="/" replace />} />
                    </Routes>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </ReservationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
