import { useId, useState } from 'react'
import { ArrowLeft, ArrowRight, Download, Eye } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Select from '../../components/ui/Select.jsx'
import { formatTimeRange } from '../../utils/time-format.js'
import { buildSimulatedApplicationHtml, simulatedDocumentFileName } from '../../utils/simulated-document.js'

function FppPage() {
  const navigate = useNavigate()
  const {
    fsk,
    recommendations,
    selectedRoom,
    fppDraft,
    pembinaList = [],
    selectedPembinaId,
    choosePembina,
    supervisorEmail,
    termsAccepted,
    setTermsAccepted,
  } = useOutletContext()
  const [pembinaTouched, setPembinaTouched] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const selectId = useId()
  const room = recommendations?.rooms.find((option) => option.id === selectedRoom)
  const logistics = room?.logistics || recommendations?.logistics || []
  const pembinaError = !selectedPembinaId ? 'Pembina wajib dipilih dari daftar kampus.' : ''

  if (!room) {
    return (
      <div className="workflow-page">
        <Card className="workflow-card workflow-empty">
          <h1>Belum ada paket terpilih</h1>
          <p>Pilih satu paket rekomendasi ruangan sebelum melanjutkan.</p>
          <Link className="text-link" to="/peminjam/ajukan/rekomendasi">Kembali ke rekomendasi</Link>
        </Card>
      </div>
    )
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
    setPembinaTouched(true)
    if (!pembinaError && termsAccepted) navigate('/peminjam/ajukan/konfirmasi')
  }

  return (
    <div className="workflow-page">
      <Link className="workflow-back-link" to="/peminjam/ajukan/rekomendasi"><ArrowLeft size={17} aria-hidden="true" />Kembali ke rekomendasi</Link>
      <header className="workflow-heading">
        <p className="eyebrow">TAHAP 1 · FPP</p>
        <h1>Dokumen &amp; Pembina</h1>
        <p className="page-description">Periksa ringkasan pengajuan dan pilih Pembina yang akan menerima tautan persetujuan.</p>
      </header>

      <Card className="document-card">
        <div className="document-card__icon"><Download size={20} aria-hidden="true" /></div>
        <div className="document-card__body">
          <p className="dashboard-section-kicker">PRATINJAU DRAFT FPP</p>
          <h2>Ringkasan Dokumen Pengajuan</h2>
          <p>Disusun dari FSK dan paket terpilih ({room.packageName || room.name}).</p>
          <div className="document-card__actions">
            <Button onClick={() => setPreviewOpen(true)} type="button" variant="secondary"><Eye size={16} aria-hidden="true" />Lihat Pratinjau</Button>
            <Button onClick={downloadDocument} type="button" variant="tertiary"><Download size={16} aria-hidden="true" />Unduh Draft</Button>
          </div>
        </div>
      </Card>

      {fppDraft?.aturan && (
        <Card className="workflow-card">
          <h2>{fppDraft.aturan.nama_aturan}</h2>
          {fppDraft.aturan.deskripsi && <p className="workflow-card__description">{fppDraft.aturan.deskripsi}</p>}
          <p style={{ whiteSpace: 'pre-line' }}>{fppDraft.aturan.ketentuan}</p>
        </Card>
      )}

      <Card className="workflow-card supervisor-card">
        <h2>Pilih Pembina</h2>
        <p className="workflow-card__description">Sistem akan mengirimkan tautan persetujuan sekali pakai ke email Pembina yang dipilih saat pengajuan dikirim.</p>
        <form className="workflow-form" noValidate onSubmit={continueToConfirmation}>
          <Select
            error={pembinaTouched ? pembinaError : ''}
            id={selectId}
            label="Pembina kegiatan"
            onBlur={() => setPembinaTouched(true)}
            onChange={(event) => choosePembina(event.target.value)}
            required
            value={selectedPembinaId}
          >
            <option value="">Pilih Pembina…</option>
            {pembinaList.map((item) => (
              <option key={item.id} value={String(item.id)}>
                {item.name} ({item.email})
              </option>
            ))}
          </Select>
          {supervisorEmail && <p className="workflow-card__description">Email tujuan: <strong>{supervisorEmail}</strong></p>}
          <label className="terms-check">
            <input checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} type="checkbox" />
            <span>Saya menyetujui Syarat dan Ketentuan pengajuan peminjaman.</span>
          </label>
          <Button disabled={Boolean(pembinaError) || !termsAccepted} type="submit">Lanjut ke Konfirmasi<ArrowRight size={16} aria-hidden="true" /></Button>
        </form>
      </Card>

      <Card className="fpp-selection-summary">
        <h2>Ringkasan pilihan</h2>
        <p><strong>{fsk.eventName}</strong> · {fsk.participants} peserta</p>
        <p>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</p>
        <p>{room.name} · {room.building}</p>
        <p>Logistik: {logistics.length ? logistics.map(({ label, quantity, unit }) => `${label} (${quantity} ${unit})`).join(', ') : 'Tidak ada'}</p>
      </Card>

      <Modal className="workflow-modal document-preview-modal" onClose={() => setPreviewOpen(false)} open={previewOpen} title="Pratinjau draft FPP">
        <article className="document-preview">
          <h3>Form Pengajuan Peminjaman</h3>
          <h4>Data Peminjam</h4>
          <dl><div><dt>Nama</dt><dd>{fsk.borrowerName}</dd></div><div><dt>Organisasi</dt><dd>{fsk.organization}</dd></div><div><dt>Nomor WhatsApp</dt><dd>{fsk.whatsapp || 'Tidak dicantumkan'}</dd></div><div><dt>Email Pembina</dt><dd>{supervisorEmail || 'Belum dipilih'}</dd></div></dl>
          <h4>Informasi Kegiatan</h4>
          <dl><div><dt>Kegiatan</dt><dd>{fsk.eventName}</dd></div><div><dt>Peserta</dt><dd>{fsk.participants}</dd></div><div><dt>Tanggal &amp; waktu</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div></dl>
          <h4>Ruangan &amp; Logistik</h4>
          <dl><div><dt>Ruangan</dt><dd>{room.name} · {room.building}</dd></div><div><dt>Logistik</dt><dd>{logistics.length ? logistics.map((item) => `${item.label} (${item.quantity} ${item.unit})`).join(', ') : 'Tidak ada tambahan'}</dd></div></dl>
        </article>
      </Modal>
    </div>
  )
}

export default FppPage
