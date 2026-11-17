import { useParams } from 'react-router'
import { ClipboardCheck } from 'lucide-react'
import Card from '../../components/ui/Card.jsx'
import Brand from '../../components/layout/Brand.jsx'

function PembinaApprovalPage() {
  const { token } = useParams()

  return (
    <main className="approval-page">
      <header className="approval-header">
        <Brand />
      </header>
      <Card className="approval-placeholder">
        <span className="empty-panel__icon"><ClipboardCheck size={22} aria-hidden="true" /></span>
        <p className="eyebrow">HALAMAN PEMBINA</p>
        <h1>Persetujuan melalui tautan email</h1>
        <p className="page-description">
          Placeholder rute persetujuan. Detail pengajuan dan keputusan belum tersedia pada fondasi frontend.
        </p>
        <p className="approval-token-state">{token ? 'Tautan persetujuan diterima.' : 'Tautan persetujuan tidak tersedia.'}</p>
      </Card>
    </main>
  )
}

export default PembinaApprovalPage
