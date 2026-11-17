import { useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Download, Eye } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatTimeRange } from '../../utils/time-format.js'
import { buildSimulatedApplicationHtml, simulatedDocumentFileName } from '../../utils/simulated-document.js'

function FppPage() {
  const navigate = useNavigate()
  const { fsk, recommendations, selectedRoom, selectedLogistics, supervisorEmail, setSupervisorEmail, termsAccepted, setTermsAccepted } = useOutletContext()
  const [emailTouched, setEmailTouched] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const emailId = useId()
  const room = recommendations?.rooms.find((option) => option.id === selectedRoom)
  const logistics = recommendations?.logistics.filter(({ id }) => selectedLogistics.includes(id)) ?? []
  const emailError = !supervisorEmail.trim()
    ? 'Email Pembina wajib diisi.'
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supervisorEmail.trim())
      ? 'Masukkan alamat email Pembina dengan format yang valid.'
      : ''

  if (!room) {
    return <div className="workflow-page"><Card className="workflow-card workflow-empty"><h1>Belum ada rekomendasi terpilih</h1><p>Pilih satu alternatif ruangan sebelum melanjutkan.</p><Link className="text-link" to="/peminjam/ajukan/rekomendasi">Kembali ke rekomendasi</Link></Card></div>
  }

  const documentData = { fsk, room, logistics, supervisorEmail }

  const downloadDocument = () => {
    const file = new Blob([buildSimulatedApplicationHtml(documentData)], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = simulatedDocumentFileName()
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const continueToConfirmation = (event) => {
    event.preventDefault()
    setEmailTouched(true)
    if (!emailError) navigate('/peminjam/ajukan/konfirmasi')
  }

  return (
    <div className="workflow-page">
      <Link className="workflow-back-link" to="/peminjam/ajukan/rekomendasi"><ArrowLeft size={17} aria-hidden="true" />Kembali ke rekomendasi</Link>
      <header className="workflow-heading">
        <p className="eyebrow">TAHAP 1 · FPP</p>
        <h1>Dokumen &amp; Pembina</h1>
        <p className="page-description">Periksa dokumen simulasi dan masukkan email Pembina untuk ringkasan pengajuan.</p>
      </header>

      <Card className="document-card">
        <div className="document-card__icon"><Download size={20} aria-hidden="true" /></div>
        <div className="document-card__body">
          <p className="dashboard-section-kicker">DOKUMEN PENGAJUAN OTOMATIS</p>
          <h2>Dokumen pengajuan (simulasi)</h2>
          <p>Ringkasan disusun dari FSK, pilihan ruangan, dan logistik yang kamu pilih.</p>
          <code>{simulatedDocumentFileName()}</code>
          <div className="document-card__actions">
            <Button onClick={() => setPreviewOpen(true)} type="button" variant="secondary"><Eye size={16} aria-hidden="true" />Lihat Pratinjau</Button>
            <Button onClick={downloadDocument} type="button" variant="tertiary"><Download size={16} aria-hidden="true" />Unduh Dokumen</Button>
          </div>
        </div>
      </Card>

      <Card className="workflow-card supervisor-card">
        <h2>Email Pembina</h2>
        <p className="workflow-card__description">Tautan persetujuan dapat dikirim setelah backend dan layanan email tersedia. Tidak ada email yang dikirim pada simulasi ini.</p>
        <form className="workflow-form" noValidate onSubmit={continueToConfirmation}>
          <Input
            autoComplete="email"
            error={emailTouched ? emailError : ''}
            id={emailId}
            label="Email Pembina"
            onBlur={() => setEmailTouched(true)}
            onChange={(event) => setSupervisorEmail(event.target.value)}
            placeholder="pembina@kampus.ac.id"
            required
            type="email"
            value={supervisorEmail}
          />
          <label className="terms-check"><input checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} type="checkbox"/><span>Saya menyetujui Syarat dan Ketentuan pengajuan peminjaman.</span></label>
          <Button disabled={Boolean(emailError) || !termsAccepted} type="submit">Lanjut ke Konfirmasi<ArrowRight size={16} aria-hidden="true" /></Button>
        </form>
      </Card>

      <Card className="fpp-selection-summary">
        <h2>Ringkasan pilihan</h2>
        <p><strong>{fsk.eventName}</strong> · {fsk.participants} peserta</p>
        <p>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</p>
        <p>{room.name} · {room.building}</p>
        <p>Logistik: {logistics.length ? logistics.map(({ label }) => label).join(', ') : 'Tidak ada'}</p>
      </Card>

      <p className="demo-disclaimer">Dokumen dan informasi ketersediaan ini hanya untuk demonstrasi frontend, bukan dokumen resmi.</p>

      <Modal className="workflow-modal document-preview-modal" onClose={() => setPreviewOpen(false)} open={previewOpen} title="Pratinjau dokumen simulasi">
        <article className="document-preview">
          <p className="document-preview__notice">DOKUMEN SIMULASI — bukan dokumen resmi</p>
          <h3>Dokumen Pengajuan Peminjaman</h3>
          <h4>Data Peminjam</h4>
          <dl><div><dt>Nama</dt><dd>{fsk.borrowerName}</dd></div><div><dt>Organisasi</dt><dd>{fsk.organization}</dd></div><div><dt>Nomor WhatsApp</dt><dd>{fsk.whatsapp || 'Tidak dicantumkan'}</dd></div><div><dt>Email Pembina</dt><dd>{supervisorEmail || 'Belum diisi'}</dd></div></dl>
          <h4>Informasi Kegiatan</h4>
          <dl><div><dt>Kegiatan</dt><dd>{fsk.eventName}</dd></div><div><dt>Peserta</dt><dd>{fsk.participants}</dd></div><div><dt>Tanggal &amp; waktu</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div></dl>
          <h4>Ruangan &amp; Logistik</h4>
          <dl><div><dt>Ruangan</dt><dd>{room.name} · {room.building}</dd></div><div><dt>Logistik</dt><dd>{logistics.length ? logistics.map((item) => item.label + ' (' + item.quantity + ' ' + item.unit + ')').join(', ') : 'Tidak ada tambahan'}</dd></div></dl>
        </article>
      </Modal>
    </div>
  )
}

export default FppPage
