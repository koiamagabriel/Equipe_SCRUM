// ─── Usuários ──────────────────────────────────────────────────────────────
export const USERS = [
  { id: 1, username: 'aluno',      password: '1234', name: 'João Silva',   role: 'Aluno' },
  { id: 2, username: 'professor',  password: '1234', name: 'Profa. Maria', role: 'Professor' },
  { id: 3, username: 'admin',      password: 'admin', name: 'Administrador', role: 'Admin' },
];

// ─── Salas ─────────────────────────────────────────────────────────────────
export const ROOMS = [
  {
    id: 'A101',
    name: 'Sala A101',
    type: 'Sala de Aula',
    capacity: 40,
    building: 'Bloco A',
    floor: '1º Andar',
    location: 'Bloco A, 1º Andar',
    notes: 'Equipada com projetor, quadro branco e ar-condicionado.',
    features: ['Projetor', 'Ar-condicionado', 'Quadro Branco'],
  },
  {
    id: 'A102',
    name: 'Sala A102',
    type: 'Sala de Aula',
    capacity: 35,
    building: 'Bloco A',
    floor: '1º Andar',
    location: 'Bloco A, 1º Andar',
    notes: 'Sala padrão com quadro branco.',
    features: ['Quadro Branco', 'Ar-condicionado'],
  },
  {
    id: 'B201',
    name: 'Sala B201',
    type: 'Sala de Aula',
    capacity: 50,
    building: 'Bloco B',
    floor: '2º Andar',
    location: 'Bloco B, 2º Andar',
    notes: 'Sala grande com sistema de som.',
    features: ['Projetor', 'Sistema de Som', 'Ar-condicionado'],
  },
  {
    id: 'LAB1',
    name: 'Lab. de Informática 1',
    type: 'Laboratório',
    capacity: 30,
    building: 'Bloco C',
    floor: 'Térreo',
    location: 'Bloco C, Térreo',
    notes: '30 computadores com acesso à internet, software de desenvolvimento instalado.',
    features: ['Computadores', 'Internet', 'Ar-condicionado'],
  },
  {
    id: 'LAB2',
    name: 'Lab. de Informática 2',
    type: 'Laboratório',
    capacity: 25,
    building: 'Bloco C',
    floor: 'Térreo',
    location: 'Bloco C, Térreo',
    notes: '25 computadores com softwares de engenharia (AutoCAD, MATLAB).',
    features: ['Computadores', 'AutoCAD', 'MATLAB', 'Ar-condicionado'],
  },
  {
    id: 'LAB3',
    name: 'Lab. de Eletrônica',
    type: 'Laboratório',
    capacity: 20,
    building: 'Bloco D',
    floor: '1º Andar',
    location: 'Bloco D, 1º Andar',
    notes: 'Equipado com bancadas, osciloscópios e fontes de alimentação.',
    features: ['Bancadas', 'Osciloscópios', 'Fontes de Alimentação'],
  },
  {
    id: 'AUD',
    name: 'Auditório Principal',
    type: 'Auditório',
    capacity: 200,
    building: 'Bloco E',
    floor: 'Térreo',
    location: 'Bloco E, Térreo',
    notes: 'Auditório principal para eventos e palestras. Requer aprovação da coordenação.',
    features: ['Microfone', 'Sistema de Som', 'Projetor', 'Palco', 'Ar-condicionado'],
  },
  {
    id: 'REU1',
    name: 'Sala de Reuniões 1',
    type: 'Sala de Reunião',
    capacity: 12,
    building: 'Bloco A',
    floor: '2º Andar',
    location: 'Bloco A, 2º Andar',
    notes: 'Sala executiva com TV e videoconferência.',
    features: ['TV', 'Videoconferência', 'Ar-condicionado'],
  },
];

// ─── Reservas iniciais (simulando dados já existentes) ──────────────────────
const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const todayStr = fmt(today);
const tomorrowStr = fmt(new Date(today.getTime() + 86400000));

export const INITIAL_RESERVATIONS = [
  {
    id: 'res-1',
    roomId: 'A101',
    userId: 2,
    userName: 'Profa. Maria',
    date: todayStr,
    startTime: '08:00',
    endTime: '10:00',
    purpose: 'Aula de Cálculo I',
    status: 'confirmada',
  },
  {
    id: 'res-2',
    roomId: 'A101',
    userId: 1,
    userName: 'João Silva',
    date: todayStr,
    startTime: '14:00',
    endTime: '16:00',
    purpose: 'Estudo em grupo — Física II',
    status: 'confirmada',
  },
  {
    id: 'res-3',
    roomId: 'LAB1',
    userId: 2,
    userName: 'Profa. Maria',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Aula prática de Programação',
    status: 'confirmada',
  },
  {
    id: 'res-4',
    roomId: 'B201',
    userId: 1,
    userName: 'João Silva',
    date: tomorrowStr,
    startTime: '09:00',
    endTime: '11:00',
    purpose: 'Apresentação de TCC',
    status: 'confirmada',
  },
];

// ─── Grade de horários ──────────────────────────────────────────────────────
export const TIME_SLOTS = [
  '08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00',
  '18:00','19:00','20:00','21:00','22:00',
];
