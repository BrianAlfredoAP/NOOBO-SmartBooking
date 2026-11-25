import { Check, ClipboardCheck } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { formatTimeRange } from '../../utils/time-format.js'

function ApplicationReceivedPage() {
  const navigate = useNavigate()
  const { lastSubmittedRequest } = useOutletContext()
  const application = lastSubmittedRequest

  if (!application) {
    return (
      <div className="workflow-page">
        <Card className="workflow-card workflow-empty">
          <h1>Data pengajuan tidak ditemukan</h1>
          <p>Mulai dari Dashboard untuk membuat pengajuan peminjaman.</p>
          <Link className="text-link" to="/peminjam">Ke Dashboard</Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="workflow-page application-received-page">
      <div aria-hidden="true" className="application-received-icon"><Check size={30} strokeWidth={2.2} /></div>
      <p className="eyebrow">PENGAJUAN TERKIRIM</p>
      <h1>Pengajuan Diterima</h1>
      <p className="application-received-intro">Pengajuan Anda berhasil dicatat dan sedang menunggu persetujuan Pembina.</p>

      <Card className="received-request-card">
        <p className="dashboard-section-kicker">NOMOR PENGAJUAN</p>
        <strong>{application.nomor_pengajuan || application.id}</strong>
        <p>{application.event?.name}</p>
        <span>{application.room?.name} · {application.room?.building}</span>
        <span>{application.event?.date} · {formatTimeRange(application.event?.startTime, application.event?.endTime)}</span>
      </Card>

      <div className="simulation-notice">
        <ClipboardCheck size={18} aria-hidden="true" />
        <p>
          Tahap berikutnya adalah persetujuan Pembina dan pemeriksaan Logistik Kampus.
          {application.email_status === 'FAILED' ? ' Catatan: pengiriman email notifikasi Pembina gagal, silakan hubungi admin/Logistik.' : ''}
        </p>
      </div>

      <Button className="received-finish" onClick={() => navigate(`/peminjam/pengajuan/${application.id}`)} type="button">Lihat Detail Pengajuan</Button>
      <Button className="received-finish" onClick={() => navigate('/peminjam')} type="button" variant="secondary">Ke Beranda</Button>
    </div>
  )
}

export default ApplicationReceivedPage
