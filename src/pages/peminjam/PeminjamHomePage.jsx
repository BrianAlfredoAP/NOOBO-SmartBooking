import { ArrowRight, CalendarDays, ChevronRight, ClipboardPlus, Clock3, MapPin } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Card from '../../components/ui/Card.jsx'
import { activeRequests, upcomingBorrowing, recentActivities } from '../../data/peminjam-demo.js'
import { formatTimeRange } from '../../utils/time-format.js'

function PeminjamHomePage() {
  const navigate = useNavigate()
  const { submittedApplications, profile, logisticsDecisions = {} } = useOutletContext()
  const resolvedRequests = activeRequests.map((request) => ({ ...request, status: logisticsDecisions[request.id]?.status || request.status }))
  const requestCount = resolvedRequests.filter(({ status }) => !['Disetujui', 'Selesai'].includes(status) && !status.includes('Ditolak')).length + submittedApplications.filter(({ status }) => !['Disetujui', 'Selesai'].includes(status) && !status.includes('Ditolak')).length
  const waitingPembina = resolvedRequests.filter(({ status }) => status.includes('Pembina')).length + submittedApplications.filter(({ supervisorStatus, status }) => (supervisorStatus || status || '').includes('Pembina')).length
  const processedLogistik = resolvedRequests.filter(({ status }) => status.includes('Logistik') || status === 'Diproses Logistik').length + submittedApplications.filter(({ status }) => ['Menunggu Pemeriksaan Logistik', 'Diproses Logistik'].includes(status)).length
  const dashboardActivities = [
    ...submittedApplications.map((application) => ({
      id: application.id,
      requestId: application.id,
      title: application.event.name,
      detail: 'Pengajuan diterima sistem simulasi',
      time: 'Baru',
    })),
    ...recentActivities,
  ].slice(0, 3)

  return (
    <div className="borrower-dashboard">
      <section aria-label="Profil peminjam" className="dashboard-greeting">
          <div aria-hidden="true" className="dashboard-avatar">{profile.initials || profile.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}</div>
        <div>
          <p>Selamat pagi,</p>
          <h1>{profile.name}</h1>
          <span>{profile.roleLabel}</span>
        </div>
      </section>

      <section aria-labelledby="active-requests-title" className="active-summary">
        <p className="dashboard-eyebrow">PENGAJUAN AKTIF</p>
        <h2 id="active-requests-title">{requestCount} proses berjalan</h2>
        <div className="active-summary__counts">
          <div><strong>{String(waitingPembina).padStart(2, '0')}</strong><span>Menunggu Pembina</span></div>
          <div><strong>{String(processedLogistik).padStart(2, '0')}</strong><span>Diproses Logistik</span></div>
        </div>
        <Link className="active-summary__link" to="/peminjam/pengajuan">
          Lihat Semua Status <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <span aria-hidden="true" className="active-summary__watermark">{String(requestCount).padStart(2, '0')}</span>
      </section>

      <Card className="application-flow">
        <div className="dashboard-section-kicker">ALUR PENGAJUAN</div>
        <h2>Dari kebutuhan ke persetujuan</h2>
        <ol className="application-flow__steps">
          <li><span>01</span><strong>Isi FSK</strong></li>
          <li><span>02</span><strong>Rekomendasi</strong></li>
          <li><span>03</span><strong>Kirim FPP</strong></li>
        </ol>
        <p className="application-flow__note">Rekomendasi membantu memilih ruangan dan logistik. Persetujuan tetap dilakukan oleh Pembina dan Logistik Kampus.</p>
      </Card>

      <Link className="dashboard-apply-button" to="/peminjam/ajukan">
        <ClipboardPlus size={19} aria-hidden="true" />
        <span>Ajukan Peminjaman</span>
        <ArrowRight size={17} aria-hidden="true" />
      </Link>

      <section className="dashboard-section" aria-labelledby="upcoming-title">
        <div className="dashboard-section__heading">
          <div><p className="dashboard-section-kicker">JADWAL TERDEKAT</p><h2 id="upcoming-title">Peminjaman mendatang</h2></div>
          <Link to="/peminjam/pengajuan">Detail</Link>
        </div>
        <button className="upcoming-card" onClick={() => navigate('/peminjam/pengajuan/NOOBO-DEMO-01')} type="button">
          <span className="upcoming-card__date"><strong>12</strong><small>NOV</small></span>
          <span className="upcoming-card__body">
            <Badge tone="success">{upcomingBorrowing.status}</Badge>
            <strong>{upcomingBorrowing.event}</strong>
            <span><MapPin size={14} aria-hidden="true" />{upcomingBorrowing.room}</span>
            <span><Clock3 size={14} aria-hidden="true" />{formatTimeRange(upcomingBorrowing.startTime, upcomingBorrowing.endTime)}</span>
          </span>
          <ChevronRight size={19} aria-hidden="true" />
        </button>
      </section>

      <section className="dashboard-section dashboard-activity" aria-labelledby="activity-title">
        <div className="dashboard-section__heading">
          <div><p className="dashboard-section-kicker">AKTIVITAS</p><h2 id="activity-title">Pengajuan terbaru</h2></div>
          <Link to="/peminjam/pengajuan">Lihat semua</Link>
        </div>
        <div className="activity-list">
          {dashboardActivities.map((activity) => (
            <button className="activity-row" key={activity.id} onClick={() => navigate(`/peminjam/pengajuan/${activity.requestId}`)} type="button">
              <span className="activity-row__icon"><CalendarDays size={18} aria-hidden="true" /></span>
              <span className="activity-row__text"><strong>{activity.title}</strong><small>{activity.detail}</small></span>
              <span className="activity-row__time">{activity.time}</span>
            </button>
          ))}
        </div>
        <p className="demo-disclaimer">Ringkasan ini menggunakan data simulasi untuk demonstrasi frontend.</p>
      </section>
    </div>
  )
}

export default PeminjamHomePage
