import { demoUser } from './demo-user.js'

export const demoRecords = [
  { id:'NOOBO-DEMO-01', event:{name:'Rapat Koordinasi UKM',date:'2026-11-12',startTime:'13:00',endTime:'15:00',participants:28,purpose:'Koordinasi program kerja'}, borrower:{name:demoUser.name,organization:demoUser.organization,whatsapp:'Belum tersedia'}, room:{name:'Ruang Rapat D-201',building:'Gedung D · Lantai 2',capacity:40,equipment:['Proyektor','Papan tulis']}, logistics:[{label:'Proyektor',quantity:1,unit:'unit'}], status:'Menunggu Persetujuan Pembina', supervisorEmail:'pembina@kampus.ac.id', pembina:'Menunggu', logistik:'Menunggu', canIssueSbp:false },
  { id:'NOOBO-DEMO-02', event:{name:'Pelatihan Organisasi',date:'2026-11-18',startTime:'09:00',endTime:'12:00',participants:45,purpose:'Pelatihan pengurus'}, borrower:{name:demoUser.name,organization:demoUser.organization,whatsapp:'Belum tersedia'}, room:{name:'Auditorium B',building:'Gedung B · Lantai 1',capacity:120,equipment:['Proyektor','Sound system','Mikrofon']}, logistics:[{label:'Mikrofon',quantity:2,unit:'unit'}], status:'Diproses Logistik', supervisorEmail:'pembina@kampus.ac.id', pembina:'Disetujui · demo', logistik:'Menunggu pemeriksaan', canIssueSbp:false },
  { id:'NOOBO-DEMO-03', event:{name:'Rapat Evaluasi Kepanitiaan',date:'2026-11-03',startTime:'14:00',endTime:'16:00',participants:18,purpose:'Evaluasi kegiatan'}, borrower:{name:demoUser.name,organization:demoUser.organization,whatsapp:'Belum tersedia'}, room:{name:'Ruang Rapat D-201',building:'Gedung D · Lantai 2',capacity:40,equipment:['Proyektor','Papan tulis']}, logistics:[{label:'Proyektor',quantity:1,unit:'unit'},{label:'Mikrofon',quantity:1,unit:'unit'}], status:'Dipinjam', supervisorEmail:'pembina@kampus.ac.id', pembina:'Disetujui · demo', logistik:'Disetujui · demo', canIssueSbp:true, returned:false },
  { id:'NOOBO-HIST-01', event:{name:'Diskusi Akademik',date:'2026-10-12',startTime:'10:00',endTime:'12:00',participants:20,purpose:'Diskusi akademik'}, borrower:{name:demoUser.name,organization:demoUser.organization,whatsapp:'Belum tersedia'}, room:{name:'Ruang Kelas C-105',building:'Gedung C · Lantai 1',capacity:32,equipment:['Papan tulis']}, logistics:[{label:'Kursi tambahan',quantity:4,unit:'unit'}], status:'Selesai', supervisorEmail:'pembina@kampus.ac.id', pembina:'Disetujui · demo', logistik:'Disetujui · demo', canIssueSbp:true, returned:true },
]

export const initialDemoNotifications = [
  { id:'n-1', title:'Pengajuan diproses Logistik', body:'Pelatihan Organisasi sedang menunggu pemeriksaan Logistik.', date:'Hari ini', category:'Pengajuan', requestId:'NOOBO-DEMO-02', read:false },
  { id:'n-2', title:'Menunggu persetujuan Pembina', body:'Rapat Koordinasi UKM menunggu keputusan Pembina.', date:'Kemarin', category:'Persetujuan', requestId:'NOOBO-DEMO-01', read:false },
  { id:'n-3', title:'SBP tersedia · simulasi', body:'Dokumen transaksi Diskusi Akademik dapat dilihat pada menu Dokumen.', date:'12 Okt 2026', category:'Dokumen', requestId:'NOOBO-HIST-01', read:false },
  { id:'n-4', title:'Pengingat kegiatan', body:'Rapat Koordinasi UKM dijadwalkan pada 12 November 2026.', date:'Pengingat demo', category:'Kegiatan', requestId:'NOOBO-DEMO-01', read:false },
  { id:'n-5', title:'Pengingat pengembalian', body:'Periksa laporan pengembalian Rapat Evaluasi Kepanitiaan.', date:'Pengingat demo', category:'Pengembalian', requestId:'NOOBO-DEMO-03', read:false },
]

export const defaultNotificationPreferences = Object.freeze({
  applicationStatus: true,
  documents: true,
  eventReminders: true,
  returnReminders: true,
  campusInformation: false,
  notificationTime: '09:00',
  doNotDisturb: false,
})
