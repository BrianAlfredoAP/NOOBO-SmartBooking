import { Check, ClipboardCheck } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { formatTimeRange } from '../../utils/time-format.js'

function ApplicationReceivedPage() {
  const navigate = useNavigate()
  const { submittedApplications, lastSubmittedRequestId } = useOutletContext()
  const application = submittedApplications.find(({ id }) => id === lastSubmittedRequestId)

  if (!application) {
    return <div className="workflow-page"><Card className="workflow-card workflow-empty"><h1>Data pengajuan tidak ditemukan</h1><p>Mulai dari Dashboard untuk membuat pengajuan simulasi.</p><Link className="text-link" to="/peminjam">Ke Dashboard</Link></Card></div>
  }

  return (
    <div className="workflow-page application-received-page">
      <div aria-hidden="true" className="application-received-icon"><Check size={30} strokeWidth={2.2} /></div>
      <p className="eyebrow">STATUS SIMULASI</p>
      <h1>Pengajuan Diterima</h1>
      <p className="application-received-intro">Pengajuan Anda berhasil dicatat oleh sistem simulasi.</p>

      <Card className="received-request-card">
        <p className="dashboard-section-kicker">NOMOR PENGAJUAN DEMO</p>
        <strong>{application.id}</strong>
        <p>{application.event.name}</p>
        <span>{application.room.name} · {application.room.building}</span>
        <span>{application.event.date} · {formatTimeRange(application.event.startTime, application.event.endTime)}</span>
      </Card>

      <div className="simulation-notice"><ClipboardCheck size={18} aria-hidden="true" /><p>Status ini hanya berarti data diterima oleh simulasi. Tahap berikutnya adalah persetujuan Pembina dan pemeriksaan Logistik Kampus.</p></div>

      <Button className="received-finish" onClick={() => navigate('/peminjam')} type="button">Selesai</Button>
    </div>
  )
}

export default ApplicationReceivedPage
