import { ArrowLeft, Bell, CalendarCheck, CircleHelp, ClipboardList, FileCheck2, FileQuestion, Info, LogOut, PackageCheck, ShieldCheck, Sparkles, ChevronDown, ChevronRight } from 'lucide-react'
import { Link, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useState } from 'react'
import Time24Input from '../../components/ui/Time24Input.jsx'

function BackLink({ to='/peminjam/profil' }) { return <Link className="workflow-back-link" to={to}><ArrowLeft size={17}/>Kembali</Link> }

function NotificationPreferences({ preferences, setPreferences }) {
  const options = [
    ['applicationStatus','Status Pengajuan'], ['documents','Dokumen SBP/SBPG'],
    ['eventReminders','Pengingat Kegiatan'], ['returnReminders','Pengingat Pengembalian'],
    ['campusInformation','Informasi dari Kampus'],
  ]
  const update = (key,value) => setPreferences(current => ({ ...current, [key]:value }))
  return <div className="workflow-page"><BackLink/><header className="workflow-heading"><p className="eyebrow">PREFERENSI</p><h1>Notifikasi</h1><p className="page-description">Pengaturan disimpan di browser ini. Tidak ada push notification sungguhan.</p></header><Card className="preference-list">{options.map(([key,label])=><label className="preference-row" key={key}><span>{label}<small>Pilih pembaruan yang ingin ditampilkan pada simulasi.</small></span><input checked={Boolean(preferences[key])} onChange={event=>update(key,event.target.checked)} role="switch" type="checkbox"/></label>)}<div className="preference-row"><span>Waktu Notifikasi<small>Waktu preferensi lokal dalam format 24 jam.</small></span><Time24Input ariaLabel="Waktu notifikasi" id="notification-time" label="Waktu notifikasi" onChange={value=>update('notificationTime',value)} value={preferences.notificationTime}/></div><label className="preference-row"><span>Do Not Disturb<small>Preferensi untuk menonaktifkan pengingat pada layanan mendatang.</small></span><input checked={Boolean(preferences.doNotDisturb)} onChange={event=>update('doNotDisturb',event.target.checked)} role="switch" type="checkbox"/></label></Card><p role="status" className="demo-disclaimer">Perubahan preferensi tersimpan pada localStorage perangkat ini.</p></div>
}

function HelpPage() {
  const faq = [
    ['Bagaimana cara mengajukan peminjaman?', 'Isi Form Spesifikasi Kebutuhan (FSK), tinjau rekomendasi ruangan dan logistik, lalu lengkapi FPP serta konfirmasi. Alur pada versi ini merupakan simulasi frontend.'],
    ['Apakah rekomendasi AI memastikan ruangan tersedia?', 'Tidak. Rekomendasi membantu memilih ruangan dan logistik. Ketersediaan serta persetujuan akhir perlu diperiksa Logistik Kampus.'],
    ['Kapan SBP tersedia?', 'SBP tersedia setelah proses persetujuan Pembina dan Logistik Kampus selesai. Dokumen dalam demo diberi penanda simulasi.'],
    ['Bagaimana cara melaporkan pengembalian?', 'Kirim laporan SBPG paling lambat satu jam setelah kegiatan selesai, lalu tunggu pemeriksaan Logistik Kampus.'],
  ]
  return <div className="workflow-page"><BackLink/><header className="workflow-heading"><p className="eyebrow">DUKUNGAN</p><h1>Bantuan &amp; Kontak</h1><p className="page-description">Temukan panduan singkat untuk menggunakan NOOBO.</p></header><section className="help-intro"><CircleHelp size={21}/><div><h2>Pusat Bantuan</h2><p>Jawaban untuk alur pengajuan dan peminjaman tersedia di FAQ berikut.</p></div></section><section className="help-faq" id="faq"><h2><FileQuestion size={18}/>Pertanyaan umum</h2>{faq.map(([question,answer])=><details key={question}><summary><span>{question}</span><ChevronDown size={17}/></summary><div className="faq-answer"><p>{answer}</p></div></details>)}</section><section className="help-contact"><h2>Hubungi Kami</h2><p>Kontak resmi belum dikonfigurasi. Informasi layanan akan ditambahkan oleh administrator.</p><Badge tone="neutral">Belum dikonfigurasi</Badge></section></div>
}

function AboutPage() {
  const features = [[ClipboardList,'Form Spesifikasi Kebutuhan (FSK)','Mencatat kebutuhan kegiatan, jadwal, dan fasilitas.'],[Sparkles,'Rekomendasi AI','Membantu memilih paket ruangan dan logistik yang sesuai.'],[FileCheck2,'Form Pengajuan Peminjaman (FPP)','Menyusun informasi pengajuan untuk ditinjau.'],[ShieldCheck,'Persetujuan','Melibatkan Pembina dan Logistik Kampus.'],[CalendarCheck,'SBP','Dokumen bukti peminjaman setelah persetujuan.'],[PackageCheck,'SBPG','Laporan fasilitas dan proses pengembalian.']]
  const developers = ['Aria Restu Pambudi','Bagas Dwi Andra','Brian Alfredo Adhita Putra','Tungkot Isahito Eleazar','M Gibran Khalilullah']
  return <div className="workflow-page about-page"><BackLink/><header className="workflow-heading"><p className="eyebrow">INFORMASI APLIKASI</p><h1>Tentang NOOBO</h1></header><section className="about-identity"><div className="about-mark" aria-hidden="true">N</div><div><h2>NOOBO</h2><p>Easy Book, Easy Use</p></div></section><section className="about-editorial"><p className="about-lead">Sistem peminjaman ruangan dan fasilitas logistik kampus berbasis web dengan rekomendasi AI.</p><p>NOOBO membantu peminjam menyampaikan kebutuhan kegiatan, memilih ruangan dan logistik, mengajukan peminjaman, serta mengikuti proses persetujuan dan pengelolaan dokumen peminjaman maupun pengembalian.</p></section><section className="about-section"><h2>Fitur utama</h2><div className="about-feature-list">{features.map(([Icon,title,description])=><div className="about-feature" key={title}><Icon size={19}/><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></section><section className="about-section"><h2>Pengembang</h2><ol className="developer-list">{developers.map((name,index)=><li key={name}><span>{String(index+1).padStart(2,'0')}</span>{name}</li>)}</ol></section><section className="about-section about-policy"><h2>Kebijakan Privasi</h2><p>Kebijakan privasi resmi masih perlu ditetapkan sebelum aplikasi digunakan dalam produksi.</p><h2>Syarat dan Ketentuan</h2><p>Ketentuan resmi perlu ditetapkan berdasarkan kebijakan kampus dan aturan peminjaman yang berlaku.</p></section></div>
}

export default function PeminjamProfilePage({ section }) {
  const { profile, notificationPreferences, setNotificationPreferences, logout } = useOutletContext()
  const [logoutOpen,setLogoutOpen]=useState(false)
  if(section==='notifikasi') return <NotificationPreferences preferences={notificationPreferences} setPreferences={setNotificationPreferences}/>
  if(section==='bantuan') return <HelpPage/>
  if(section==='tentang') return <AboutPage/>
  return <div className="workflow-page"><header className="workflow-heading"><p className="eyebrow">AKUN PEMINJAM</p><h1>Profil Saya</h1></header><Card className="profile-card"><div aria-hidden="true" className="dashboard-avatar">{profile.initials||'AR'}</div><div className="profile-identity"><h2>{profile.name}</h2><p>Mahasiswa · Peminjam</p></div><dl className="confirmation-details profile-readonly"><div><dt>NIM</dt><dd>{profile.nim||'Belum tersedia pada akun demo'}</dd></div><div><dt>Program Studi</dt><dd>{profile.programStudi||'Belum tersedia pada akun demo'}</dd></div><div><dt>Organisasi/Unit</dt><dd>{profile.organization||'Belum tersedia pada akun demo'}</dd></div><div><dt>Email Kampus</dt><dd>{profile.email}</dd></div><div><dt>Nomor WhatsApp</dt><dd>{profile.whatsapp||'Belum tersedia pada akun demo'}</dd></div></dl><p className="demo-disclaimer">Identitas mahasiswa bersifat read-only dan akan berasal dari data kampus.</p></Card><section className="profile-menu"><h2>Pengaturan &amp; informasi</h2>{[[Bell,'Preferensi Notifikasi','Atur jenis pembaruan yang ditampilkan.','/peminjam/profil/notifikasi'],[CircleHelp,'Bantuan & Kontak','Panduan penggunaan dan pertanyaan umum.','/peminjam/profil/bantuan'],[Info,'Tentang NOOBO','Informasi aplikasi dan fitur.','/peminjam/profil/tentang']].map(([Icon,label,description,to])=><Link className="profile-menu-card" key={to} to={to}><Icon size={19}/><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={18} aria-hidden="true"/></Link>)}</section><Button className="profile-logout" variant="tertiary" onClick={()=>setLogoutOpen(true)}><LogOut size={16}/>Keluar</Button><Modal open={logoutOpen} onClose={()=>setLogoutOpen(false)} title="Keluar dari akun demo?"><p className="modal-copy">Sesi demonstrasi akan diakhiri.</p><div className="modal-actions"><Button variant="secondary" onClick={()=>setLogoutOpen(false)}>Batal</Button><Button onClick={logout}>Keluar</Button></div></Modal></div>
}
