import { ArrowRight, CalendarDays, ClipboardList, ClipboardPlus } from 'lucide-react'
import { Link, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import { formatTimeRange } from '../../utils/time-format.js'

const ACTIVE_CODES = new Set([
  'SUBMITTED',
  'WAITING_PEMBINA',
  'WAITING_LOGISTIK',
  'REVISION_LOGISTIK',
  'APPROVED_LOGISTIK',
  'ONGOING',
  'RETURN_REPORTED',
])

function formatShortDate(value) {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function PeminjamHomePage() {
  const { profile, submittedApplications = [], dataLoading, dataError } = useOutletContext()
  const active = submittedApplications.filter((item) => ACTIVE_CODES.has(item.status_code))
  const waitingPembina = submittedApplications.filter((item) => item.status_code === 'WAITING_PEMBINA' || item.status_code === 'SUBMITTED')
  const processingLogistik = submittedApplications.filter((item) => item.status_code === 'WAITING_LOGISTIK' || item.status_code === 'REVISION_LOGISTIK')
  const upcoming = submittedApplications
    .filter((item) => item.status_code === 'APPROVED_LOGISTIK' || item.status_code === 'ONGOING')
    .sort((a, b) => (a.event?.date || '').localeCompare(b.event?.date || ''))
    .slice(0, 3)
  const latest = submittedApplications.slice(0, 3)

  return (
    <div className="borrower-dashboard">
      <section aria-label="Profil peminjam" className="dashboard-greeting">
        <div aria-hidden="true" className="dashboard-avatar">
          {profile.name.split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p>Selamat datang,</p>
          <h1>{profile.name}</h1>
          <span>{profile.roleLabel}</span>
        </div>
      </section>

      {dataError && <p className="logistik-error" role="alert">{dataError}</p>}

      <section aria-labelledby="active-requests-title" className="active-summary">
        <p className="dashboard-eyebrow">PENGAJUAN AKTIF</p>
        <h2 id="active-requests-title">{dataLoading ? 'Memuat…' : `${active.length} proses berjalan`}</h2>
        <div className="active-summary__counts">
          <div><strong>{String(waitingPembina.length).padStart(2, '0')}</strong><span>Menunggu Pembina</span></div>
          <div><strong>{String(processingLogistik.length).padStart(2, '0')}</strong><span>Diproses Logistik</span></div>
        </div>
        <Link className="active-summary__link" to="/peminjam/pengajuan">
          Lihat Semua Status <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <span aria-hidden="true" className="active-summary__watermark">{String(active.length).padStart(2, '0')}</span>
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
        {upcoming.length ? (
          <div className="status-list">
            {upcoming.map((item) => (
              <Link className="workspace-record" key={item.id} to={`/peminjam/pengajuan/${item.id}`}>
                <span className="workspace-record__icon"><CalendarDays size={18} aria-hidden="true" /></span>
                <span className="workspace-record__body">
                  <strong>{item.event?.name}</strong>
                  <small>{item.room?.name || 'Ruangan'} · {formatShortDate(item.event?.date)} · {formatTimeRange(item.event?.startTime, item.event?.endTime)}</small>
                  <Badge tone="success">{item.status}</Badge>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="logistik-empty">Belum ada jadwal peminjaman.</p>
        )}
      </section>

      <section className="dashboard-section dashboard-activity" aria-labelledby="activity-title">
        <div className="dashboard-section__heading">
          <div><p className="dashboard-section-kicker">AKTIVITAS</p><h2 id="activity-title">Pengajuan terbaru</h2></div>
        </div>
        {latest.length ? (
          <div className="status-list">
            {latest.map((item) => (
              <Link className="workspace-record" key={item.id} to={`/peminjam/pengajuan/${item.id}`}>
                <span className="workspace-record__icon"><ClipboardList size={18} aria-hidden="true" /></span>
                <span className="workspace-record__body">
                  <strong>{item.event?.name}</strong>
                  <small>{item.nomor_pengajuan || item.id} · {formatShortDate(item.event?.date)}</small>
                  <Badge tone={item.status_code === 'COMPLETED' || item.status_code === 'ONGOING' || item.status_code === 'APPROVED_LOGISTIK' ? 'success' : item.status_code?.includes('REJECTED') ? 'danger' : 'warning'}>{item.status}</Badge>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="logistik-empty">Belum ada aktivitas pengajuan.</p>
        )}
      </section>
    </div>
  )
}

export default PeminjamHomePage
