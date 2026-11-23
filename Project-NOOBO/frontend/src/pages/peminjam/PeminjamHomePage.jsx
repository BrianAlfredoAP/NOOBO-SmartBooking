import { ArrowRight, ClipboardPlus } from 'lucide-react'
import { Link, useOutletContext } from 'react-router'

function PeminjamHomePage() {
  const { profile } = useOutletContext()

  return (
    <div className="borrower-dashboard">
      <section aria-label="Profil peminjam" className="dashboard-greeting">
        <div aria-hidden="true" className="dashboard-avatar">
          {profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p>Selamat datang,</p>
          <h1>{profile.name}</h1>
          <span>{profile.roleLabel}</span>
        </div>
      </section>

      <section aria-labelledby="active-requests-title" className="active-summary">
        <p className="dashboard-eyebrow">PENGAJUAN AKTIF</p>
        <h2 id="active-requests-title">0 proses berjalan</h2>
        <div className="active-summary__counts">
          <div><strong>00</strong><span>Menunggu Pembina</span></div>
          <div><strong>00</strong><span>Diproses Logistik</span></div>
        </div>
        <Link className="active-summary__link" to="/peminjam/pengajuan">
          Lihat Semua Status <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <span aria-hidden="true" className="active-summary__watermark">00</span>
      </section>

      <Link className="dashboard-apply-button" to="/peminjam/ajukan">
        <ClipboardPlus size={19} aria-hidden="true" />
        <span>Ajukan Peminjaman</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Link>

      <section className="dashboard-section" aria-labelledby="upcoming-title">
        <div className="dashboard-section__heading">
          <div><p className="dashboard-section-kicker">JADWAL TERDEKAT</p><h2 id="upcoming-title">Peminjaman mendatang</h2></div>
        </div>
        <p className="logistik-empty">Belum ada jadwal peminjaman.</p>
      </section>

      <section className="dashboard-section dashboard-activity" aria-labelledby="activity-title">
        <div className="dashboard-section__heading">
          <div><p className="dashboard-section-kicker">AKTIVITAS</p><h2 id="activity-title">Pengajuan terbaru</h2></div>
        </div>
        <p className="logistik-empty">Belum ada aktivitas pengajuan.</p>
      </section>
    </div>
  )
}

export default PeminjamHomePage
