import { demoUser } from './demo-user.js'
import { initialLogistikRooms, initialLogistikInventory } from './logistik-demo.js'

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
  ...initialLogistikInventory.map(({ id, name, unit, stock }) => ({ id, label: name, unit, stock })),
  { id: 'lainnya', label: 'Lainnya', unit: '', stock: null },
]

export const demoRooms = initialLogistikRooms.map((room) => ({ ...room, building: `${room.building} · Lantai ${room.floor}` }))

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
