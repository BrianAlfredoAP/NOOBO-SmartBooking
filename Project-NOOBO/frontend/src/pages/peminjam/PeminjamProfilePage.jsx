import { useState } from 'react'
import { ArrowLeft, Bell, CalendarCheck, ChevronDown, ChevronRight, CircleHelp, ClipboardList, FileCheck2, FileQuestion, Info, LogOut, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'
import { Link, useOutletContext } from 'react-router'
import AboutBrand from '../../components/layout/AboutBrand.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Time24Input from '../../components/ui/Time24Input.jsx'

function BackLink({ to = '/peminjam/profil' }) {
  return <Link className="workflow-back-link" to={to}><ArrowLeft size={17} />Kembali</Link>
}

function NotificationPreferences({ preferences, setPreferences }) {
  const options = [
    ['applicationStatus', 'Status Pengajuan'],
    ['documents', 'Dokumen SBP/SBPG'],
    ['eventReminders', 'Pengingat Kegiatan'],
    ['returnReminders', 'Pengingat Pengembalian'],
    ['campusInformation', 'Informasi dari Kampus'],
  ]
  const update = (key, value) => setPreferences((current) => ({ ...current, [key]: value }))
  return (
    <div className="workflow-page">
      <BackLink />
      <header className="workflow-heading"><p className="eyebrow">PREFERENSI</p><h1>Notifikasi</h1><p className="page-description">Atur kategori notifikasi yang ditampilkan pada perangkat ini.</p></header>
      <Card className="preference-list">
        {options.map(([key, label]) => (
          <label className="preference-row" key={key}>
            <span>{label}<small>Tampilkan pembaruan untuk kategori ini.</small></span>
            <input checked={Boolean(preferences[key])} onChange={(event) => update(key, event.target.checked)} role="switch" type="checkbox" />
          </label>
        ))}
        <div className="preference-row">
          <span>Waktu Notifikasi<small>Waktu preferensi lokal dalam format 24 jam.</small></span>
          <Time24Input ariaLabel="Waktu notifikasi" id="notification-time" label="Waktu notifikasi" onChange={(value) => update('notificationTime', value)} value={preferences.notificationTime} />
        </div>
        <label className="preference-row">
          <span>Do Not Disturb<small>Nonaktifkan sementara tampilan notifikasi di perangkat ini.</small></span>
          <input checked={Boolean(preferences.doNotDisturb)} onChange={(event) => update('doNotDisturb', event.target.checked)} role="switch" type="checkbox" />
        </label>
      </Card>
    </div>
  )
}

function HelpPage() {
  const faq = [
    ['Bagaimana cara mengajukan peminjaman?', 'Isi Form Spesifikasi Kebutuhan (FSK), pilih paket rekomendasi ruangan dan logistik, lalu lengkapi FPP dan pilih Pembina untuk mengirim pengajuan.'],
    ['Apakah rekomendasi memastikan ruangan otomatis dibooking?', 'Tidak. Ketersediaan akan diverifikasi ulang saat pemilihan paket dan dikunci oleh Logistik Kampus setelah disetujui Pembina dan Logistik.'],
    ['Kapan SBP tersedia?', 'SBP resmi (PDF) tersedia setelah disetujui Pembina dan Logistik Kampus serta diterbitkan oleh Logistik.'],
    ['Bagaimana cara melaporkan pengembalian?', 'Kirim laporan SBPG paling lambat satu jam setelah kegiatan selesai, lalu tunggu pemeriksaan fisik Logistik Kampus.'],
  ]
  return (
    <div className="workflow-page">
      <BackLink />
      <header className="workflow-heading"><p className="eyebrow">DUKUNGAN</p><h1>Bantuan &amp; Kontak</h1><p className="page-description">Temukan panduan singkat untuk menggunakan NOOBO.</p></header>
      <section className="help-intro"><CircleHelp size={21} /><div><h2>Pusat Bantuan</h2><p>Jawaban untuk alur pengajuan dan peminjaman tersedia di FAQ berikut.</p></div></section>
      <section className="help-faq" id="faq">
        <h2><FileQuestion size={18} />Pertanyaan umum</h2>
        {faq.map(([question, answer]) => <details key={question}><summary><span>{question}</span><ChevronDown size={17} /></summary><div className="faq-answer"><p>{answer}</p></div></details>)}
      </section>
      <section className="help-contact"><h2>Hubungi Kami</h2><p>Hubungi unit Logistik Kampus melalui saluran resmi kampus bila mengalami kendala.</p><Badge tone="neutral">Layanan Kampus</Badge></section>
    </div>
  )
}

function AboutPage() {
  const features = [
    [ClipboardList, 'Form Spesifikasi Kebutuhan (FSK)', 'Mencatat kebutuhan kegiatan, jadwal, dan fasilitas.'],
    [Sparkles, 'Rekomendasi Paket', 'Membantu memilih paket ruangan dan logistik yang sesuai.'],
    [FileCheck2, 'Form Pengajuan Peminjaman (FPP)', 'Menyusun informasi pengajuan untuk ditinjau.'],
    [ShieldCheck, 'Persetujuan', 'Melibatkan Pembina dan Logistik Kampus.'],
    [CalendarCheck, 'SBP', 'Dokumen bukti peminjaman resmi setelah persetujuan.'],
    [PackageCheck, 'SBPG', 'Laporan fasilitas dan proses pengembalian.'],
  ]
  const developers = ['Aria Restu Pambudi', 'Bagas Dwi Andra', 'Brian Alfredo Adhita Putra', 'Tungkot Isahito Eleazar', 'M Gibran Khalilullah']
  return (
    <div className="workflow-page about-page">
      <BackLink />
      <header className="workflow-heading"><p className="eyebrow">INFORMASI APLIKASI</p><h1>Tentang NOOBO</h1></header>
      <AboutBrand />
      <section className="about-editorial"><p className="about-lead">Sistem peminjaman ruangan dan fasilitas logistik kampus berbasis web dengan rekomendasi paket.</p><p>NOOBO membantu peminjam menyampaikan kebutuhan kegiatan, memilih ruangan dan logistik, mengajukan peminjaman, serta mengikuti proses persetujuan dan pengelolaan dokumen peminjaman maupun pengembalian.</p></section>
      <section className="about-section"><h2>Fitur utama</h2><div className="about-feature-list">{features.map(([Icon, title, description]) => <div className="about-feature" key={title}><Icon size={19} /><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></section>
      <section className="about-section"><h2>Pengembang</h2><ol className="developer-list">{developers.map((name, index) => <li key={name}><span>{String(index + 1).padStart(2, '0')}</span>{name}</li>)}</ol></section>
    </div>
  )
}

export default function PeminjamProfilePage({ section }) {
  const { profile, setProfile, notificationPreferences, setNotificationPreferences, logout } = useOutletContext()
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState(profile.name)
  const [editWhatsapp, setEditWhatsapp] = useState(profile.whatsapp || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState('')

  if (section === 'notifikasi') return <NotificationPreferences preferences={notificationPreferences} setPreferences={setNotificationPreferences} />
  if (section === 'bantuan') return <HelpPage />
  if (section === 'tentang') return <AboutPage />

  const openEdit = () => {
    setEditName(profile.name)
    setEditWhatsapp(profile.whatsapp || '')
    setFeedback('')
    setEditOpen(true)
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    if (!editName.trim() || saving) return
    setSaving(true)
    setFeedback('')
    try {
      await setProfile({ name: editName.trim(), whatsapp: editWhatsapp.trim() })
      setEditOpen(false)
      setFeedback('Profil berhasil diperbarui.')
    } catch (error) {
      setFeedback(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="workflow-page">
      <header className="workflow-heading"><p className="eyebrow">AKUN PEMINJAM</p><h1>Profil Saya</h1></header>
      <Card className="profile-card">
        <div aria-hidden="true" className="dashboard-avatar">{profile.initials || 'PM'}</div>
        <div className="profile-identity"><h2>{profile.name}</h2><p>Mahasiswa · Peminjam</p></div>
        <dl className="confirmation-details profile-readonly">
          <div><dt>Email Kampus</dt><dd>{profile.email}</dd></div>
          <div><dt>Nomor WhatsApp</dt><dd>{profile.whatsapp || 'Belum diisi'}</dd></div>
        </dl>
        <div className="workspace-actions"><Button onClick={openEdit} type="button" variant="secondary">Ubah Profil</Button></div>
        {feedback && <p className="form-feedback" role="status">{feedback}</p>}
      </Card>
      <section className="profile-menu">
        <h2>Pengaturan &amp; informasi</h2>
        {[
          [Bell, 'Preferensi Notifikasi', 'Atur jenis pembaruan yang ditampilkan.', '/peminjam/profil/notifikasi'],
          [CircleHelp, 'Bantuan & Kontak', 'Panduan penggunaan dan pertanyaan umum.', '/peminjam/profil/bantuan'],
          [Info, 'Tentang NOOBO', 'Informasi aplikasi dan fitur.', '/peminjam/profil/tentang'],
        ].map(([Icon, label, description, to]) => (
          <Link className="profile-menu-card" key={to} to={to}>
            <Icon size={19} /><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </section>
      <Button className="profile-logout" variant="tertiary" onClick={() => setLogoutOpen(true)}><LogOut size={16} />Keluar</Button>
      <Modal open={editOpen} onClose={() => !saving && setEditOpen(false)} title="Ubah Profil">
        <form className="workflow-form" onSubmit={saveProfile}>
          <Input label="Nama lengkap" onChange={(e) => setEditName(e.target.value)} required value={editName} />
          <Input label="Nomor WhatsApp" onChange={(e) => setEditWhatsapp(e.target.value)} type="tel" value={editWhatsapp} />
          <div className="modal-actions">
            <Button disabled={saving} type="button" variant="secondary" onClick={() => setEditOpen(false)}>Batal</Button>
            <Button disabled={saving || !editName.trim()} type="submit">{saving ? 'Menyimpan…' : 'Simpan'}</Button>
          </div>
        </form>
      </Modal>
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari akun?">
        <p className="modal-copy">Sesi Anda akan diakhiri.</p>
        <div className="modal-actions"><Button variant="secondary" onClick={() => setLogoutOpen(false)}>Batal</Button><Button onClick={logout}>Keluar</Button></div>
      </Modal>
    </div>
  )
}
