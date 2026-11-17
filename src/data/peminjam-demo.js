import { demoUser } from './demo-user.js'

export const activeRequests = [
  { id: 'NOOBO-DEMO-01', activity: 'Rapat Koordinasi UKM', status: 'Menunggu Persetujuan Pembina' },
  { id: 'NOOBO-DEMO-02', activity: 'Pelatihan Organisasi', status: 'Diproses Logistik' },
]

export const upcomingBorrowing = {
  event: 'Rapat Koordinasi UKM',
  dateLabel: '12 Nov 2026',
  date: '2026-11-12',
  startTime: '13:00',
  endTime: '15:00',
  room: 'Ruang Rapat Gedung D',
  status: 'Disetujui',
}

export const recentActivities = [
  { id: 'activity-1', requestId: 'NOOBO-DEMO-02', title: 'Pelatihan Organisasi', detail: 'Pengajuan diproses Logistik', time: 'Hari ini' },
  { id: 'activity-2', requestId: 'NOOBO-DEMO-01', title: 'Rapat Koordinasi UKM', detail: 'Menunggu Persetujuan Pembina', time: 'Kemarin' },
]

export const demoEquipment = [
  { id: 'proyektor', label: 'Proyektor', unit: 'unit', stock: 4 },
  { id: 'mikrofon', label: 'Mikrofon', unit: 'unit', stock: 8 },
  { id: 'sound-system', label: 'Sound system', unit: 'set', stock: 2 },
  { id: 'papan-tulis', label: 'Papan tulis', unit: 'unit', stock: 3 },
  { id: 'kursi-tambahan', label: 'Kursi tambahan', unit: 'unit', stock: 60 },
  { id: 'ht', label: 'HT', unit: 'unit', stock: 6 },
  { id: 'lainnya', label: 'Lainnya', unit: '', stock: null },
]

const rooms = [
  { id: 'ruang-d-201', name: 'Ruang Rapat D-201', code: 'D-201', building: 'Gedung D', floor: '2', capacity: 40, equipment: ['Proyektor', 'Papan tulis'], available: true, condition: 'Baik', description: 'Ruang rapat untuk kegiatan organisasi dan koordinasi.' },
  { id: 'auditorium-b', name: 'Auditorium B', code: 'AUD-B', building: 'Gedung B', floor: '1', capacity: 120, equipment: ['Proyektor', 'Sound system', 'Mikrofon'], available: true, condition: 'Baik', description: 'Auditorium untuk kegiatan dengan peserta dalam jumlah besar.' },
  { id: 'ruang-c-105', name: 'Ruang Kelas C-105', code: 'C-105', building: 'Gedung C', floor: '1', capacity: 32, equipment: ['Papan tulis'], available: false, condition: 'Perlu pemeriksaan', description: 'Ruang kelas; ketersediaan contoh saat ini tidak aktif.' },
  { id: 'lab-informatika-1', name: 'Laboratorium Informatika 1', code: 'LAB-INF-1', building: 'Gedung E', floor: '3', capacity: 30, equipment: ['Proyektor', 'Papan tulis'], available: true, condition: 'Baik', description: 'Laboratorium untuk kegiatan akademik.' },
]

export const demoRooms = rooms.map((room) => ({ ...room, building: `${room.building} · Lantai ${room.floor}` }))

export const initialFsk = {
  borrowerName: demoUser.name,
  organization: demoUser.organization,
  whatsapp: '',
  eventName: '',
  purpose: '',
  participants: '',
  date: '',
  endDate: '',
  startTime: '',
  endTime: '',
  equipment: {},
  otherEquipment: '',
  specialNeeds: '',
}
