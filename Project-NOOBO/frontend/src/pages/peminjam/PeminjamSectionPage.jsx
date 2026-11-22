import { ArrowRight, ClipboardList } from 'lucide-react'
import { Link } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Card from '../../components/ui/Card.jsx'
import { activeRequests } from '../../data/peminjam-demo.js'
import { demoUser } from '../../data/demo-user.js'
import { useAuth } from '../../context/auth-context.js'
import { useNavigate } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import { useOutletContext } from 'react-router'

const copy = {
  pengajuan: { eyebrow: 'PENGAJUAN', title: 'Status pengajuan', description: 'Ringkasan pengajuan peminjaman pada data demonstrasi.' },
  riwayat: { eyebrow: 'RIWAYAT', title: 'Riwayat peminjaman', description: 'Pengajuan yang selesai akan ditampilkan di sini.' },
  profil: { eyebrow: 'PROFIL', title: 'Profil peminjam', description: 'Informasi profil contoh untuk demonstrasi frontend.' },
}

function PeminjamSectionPage({ section }) {
  const page = copy[section]
  const navigate = useNavigate()
  const { user, endDemoSession } = useAuth()
  const { submittedApplications } = useOutletContext()

  const logout = () => {
    endDemoSession()
    navigate('/auth', { replace: true })
  }

  return (
    <div className="workflow-page">
      <header className="workflow-heading">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="page-description">{page.description}</p>
      </header>
      {section === 'pengajuan' && (
        <div className="status-list">
          {[
            ...submittedApplications.map((application) => ({
              id: application.id,
              activity: application.event.name,
              status: application.status,
            })),
            ...activeRequests,
          ].map((request) => (
            <Card className="status-card" key={request.id}>
              <span className="status-card__icon"><ClipboardList size={19} aria-hidden="true" /></span>
              <div><strong>{request.activity}</strong><small>{request.id}</small><Badge tone={request.status === 'Pengajuan Diterima' ? 'info' : 'warning'}>{request.status}</Badge></div>
              <ArrowRight size={17} aria-hidden="true" />
            </Card>
          ))}
        </div>
      )}
      {section === 'riwayat' && <Card className="workflow-card workflow-empty"><h2>Belum ada riwayat selesai</h2><p>Data riwayat peminjaman belum tersedia pada demonstrasi ini.</p><Link className="text-link" to="/peminjam/ajukan">Mulai pengajuan</Link></Card>}
      {section === 'profil' && <Card className="workflow-card profile-card"><div className="dashboard-avatar">{demoUser.initials}</div><h2>{user.name}</h2><p>{demoUser.roleLabel}</p><p>{user.email}</p><p>{demoUser.organization}</p><small>Profil ini menggunakan data contoh frontend.</small><Button className="profile-logout" onClick={logout} type="button" variant="secondary">Keluar</Button></Card>}
      {section === 'pengajuan' && <p className="demo-disclaimer">Status dan identitas pengajuan di atas adalah data simulasi frontend.</p>}
    </div>
  )
}

export default PeminjamSectionPage
