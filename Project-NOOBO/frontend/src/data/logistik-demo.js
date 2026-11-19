export const demoLogistikUser = Object.freeze({
  name: 'Admin Logistik',
  email: 'logistik@kampus.ac.id',
  password: '12345678',
  role: 'logistik',
  roleLabel: 'Petugas · Logistik Kampus',
  unit: 'Bagian Sarana dan Prasarana',
  initials: 'AL',
})

export const initialLogistikRooms = [
  { id: 'ruang-d-201', name: 'Ruang Rapat D-201', code: 'D-201', building: 'Gedung D', floor: '2', capacity: 40, equipment: ['Proyektor', 'Papan tulis'], available: true, condition: 'Baik', description: 'Ruang rapat untuk kegiatan organisasi dan koordinasi.' },
  { id: 'auditorium-b', name: 'Auditorium B', code: 'AUD-B', building: 'Gedung B', floor: '1', capacity: 120, equipment: ['Proyektor', 'Sound system', 'Mikrofon'], available: true, condition: 'Baik', description: 'Auditorium untuk kegiatan dengan peserta dalam jumlah besar.' },
  { id: 'ruang-c-105', name: 'Ruang Kelas C-105', code: 'C-105', building: 'Gedung C', floor: '1', capacity: 32, equipment: ['Papan tulis'], available: false, condition: 'Perlu pemeriksaan', description: 'Ruang kelas; ketersediaan contoh saat ini tidak aktif.' },
  { id: 'lab-informatika-1', name: 'Laboratorium Informatika 1', code: 'LAB-INF-1', building: 'Gedung E', floor: '3', capacity: 30, equipment: ['Proyektor', 'Papan tulis'], available: true, condition: 'Baik', description: 'Laboratorium untuk kegiatan akademik.' },
]

export const initialLogistikInventory = [
  { id: 'proyektor', name: 'Proyektor', category: 'Elektronik', stock: 4, condition: 'Baik', location: 'Gudang Logistik', unit: 'unit', available: true, description: 'Proyektor presentasi.' },
  { id: 'mikrofon', name: 'Mikrofon', category: 'Audio', stock: 8, condition: 'Baik', location: 'Gudang Logistik', unit: 'unit', available: true, description: 'Mikrofon untuk kegiatan kampus.' },
  { id: 'sound-system', name: 'Sound system', category: 'Audio', stock: 2, condition: 'Baik', location: 'Gudang Logistik', unit: 'set', available: true, description: 'Perangkat tata suara.' },
  { id: 'papan-tulis', name: 'Papan tulis', category: 'Perlengkapan ruang', stock: 3, condition: 'Baik', location: 'Gudang Logistik', unit: 'unit', available: true, description: 'Papan tulis portabel.' },
  { id: 'kursi-tambahan', name: 'Kursi tambahan', category: 'Perlengkapan ruang', stock: 60, condition: 'Baik', location: 'Gudang Logistik', unit: 'unit', available: true, description: 'Kursi lipat tambahan.' },
  { id: 'ht', name: 'HT', category: 'Komunikasi', stock: 6, condition: 'Baik', location: 'Gudang Logistik', unit: 'unit', available: true, description: 'Alat komunikasi untuk panitia.' },
]

export const applicationStatusDemo = Object.freeze({ pendingSupervisor: 'Menunggu Persetujuan Pembina', pendingLogistics: 'Menunggu Pemeriksaan Logistik', approved: 'Disetujui', rejected: 'Ditolak Logistik', revision: 'Perlu Perbaikan' })
