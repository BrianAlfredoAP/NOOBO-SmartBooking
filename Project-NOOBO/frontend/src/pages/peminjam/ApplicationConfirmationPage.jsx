import { useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, ContactRound, MapPin } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatTimeRange } from '../../utils/time-format.js'

function SummarySection({ title, icon: Icon, onEdit, children }) {
  return (
    <Card className="confirmation-section">
      <div className="confirmation-section__heading">
        <div><Icon size={18} aria-hidden="true" /><h2>{title}</h2></div>
        <button className="confirmation-edit" onClick={onEdit} type="button">Ubah</button>
      </div>
      {children}
    </Card>
  )
}

function ApplicationConfirmationPage() {
  const navigate = useNavigate()
  const {
    fsk,
    recommendations,
    selectedRoom,
    supervisorEmail,
    selectedPembinaId,
    pembinaList = [],
    setFskStep,
    clearRecommendations,
    submitApplication,
  } = useOutletContext()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const room = recommendations?.rooms.find((option) => option.id === selectedRoom)
  const logistics = room?.logistics || recommendations?.logistics || []
  const selectedPembina = pembinaList.find((item) => String(item.id) === String(selectedPembinaId))

  if (!room) {
    return (
      <div className="workflow-page">
        <Card className="workflow-card workflow-empty">
          <h1>Pilihan ruangan tidak ditemukan</h1>
          <p>Pilih kembali rekomendasi sebelum mengonfirmasi pengajuan.</p>
          <Link className="text-link" to="/peminjam/ajukan/rekomendasi">Kembali ke rekomendasi</Link>
        </Card>
      </div>
    )
  }

  const editAt = (step) => {
    clearRecommendations()
    setFskStep(step)
    navigate('/peminjam/ajukan')
  }

  const finishSubmission = async () => {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitApplication()
      setConfirmOpen(false)
    } catch (error) {
      setConfirmOpen(false)
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="workflow-page">
      <Link className="workflow-back-link" to="/peminjam/ajukan/fpp"><ArrowLeft size={17} aria-hidden="true" />Kembali</Link>
      <header className="workflow-heading">
        <p className="eyebrow">TAHAP 2 · FPP</p>
        <h1>Konfirmasi Pengajuan</h1>
        <p className="page-description">Periksa kembali data pengajuan peminjaman Anda sebelum dikirim ke Pembina.</p>
      </header>

      <SummarySection icon={ContactRound} onEdit={() => editAt(0)} title="Data Peminjam">
        <dl className="confirmation-details">
          <div><dt>Nama</dt><dd>{fsk.borrowerName}</dd></div>
          <div><dt>Organisasi</dt><dd>{fsk.organization}</dd></div>
          <div><dt>Nomor WhatsApp</dt><dd>{fsk.whatsapp || 'Tidak dicantumkan'}</dd></div>
          <div><dt>Pembina</dt><dd>{selectedPembina ? `${selectedPembina.name} (${selectedPembina.email})` : supervisorEmail}</dd></div>
        </dl>
      </SummarySection>

      <SummarySection icon={CalendarDays} onEdit={() => editAt(0)} title="Informasi Kegiatan">
        <dl className="confirmation-details">
          <div><dt>Nama kegiatan</dt><dd>{fsk.eventName}</dd></div>
          <div><dt>Tujuan</dt><dd>{fsk.purpose || 'Tidak dicantumkan'}</dd></div>
        </dl>
      </SummarySection>

      <SummarySection icon={CalendarDays} onEdit={() => editAt(1)} title="Jumlah Peserta &amp; Jadwal">
        <dl className="confirmation-details">
          <div><dt>Jumlah peserta</dt><dd>{fsk.participants} orang</dd></div>
          <div><dt>Tanggal &amp; waktu</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div>
        </dl>
      </SummarySection>

      <SummarySection icon={MapPin} onEdit={() => editAt(2)} title="Fasilitas &amp; Logistik">
        <dl className="confirmation-details">
          <div><dt>Pilihan</dt><dd>{logistics.length ? logistics.map(({ label, quantity, unit }) => `${label} (${quantity} ${unit})`).join(', ') : 'Tidak ada logistik tambahan'}</dd></div>
          {fsk.specialNeeds && <div><dt>Catatan</dt><dd>{fsk.specialNeeds}</dd></div>}
        </dl>
      </SummarySection>

      <SummarySection icon={MapPin} onEdit={() => navigate('/peminjam/ajukan/rekomendasi')} title="Ruangan yang Dipilih">
        <dl className="confirmation-details">
          <div><dt>Nama ruangan</dt><dd>{room.name}</dd></div>
          <div><dt>Gedung &amp; lokasi</dt><dd>{room.building}</dd></div>
          <div><dt>Kapasitas</dt><dd>{room.capacity} orang</dd></div>
          <div><dt>Fasilitas tersedia</dt><dd>{room.equipment.join(', ') || 'Tidak ada catatan fasilitas bawaan'}</dd></div>
        </dl>
      </SummarySection>

      <Card className="confirmation-section">
        <div className="confirmation-section__heading">
          <div><ContactRound size={18} aria-hidden="true" /><h2>Pembina</h2></div>
          <Link className="confirmation-edit" to="/peminjam/ajukan/fpp">Ubah</Link>
        </div>
        <dl className="confirmation-details">
          <div><dt>Nama Pembina</dt><dd>{selectedPembina?.name || '-'}</dd></div>
          <div><dt>Email Pembina</dt><dd>{supervisorEmail}</dd></div>
        </dl>
      </Card>

      {submitError && <p className="logistik-error" role="alert">{submitError}</p>}

      <div className="confirmation-actions">
        <Button disabled={submitting} onClick={() => navigate('/peminjam/ajukan/fpp')} type="button" variant="secondary">Kembali</Button>
        <Button disabled={submitting} onClick={() => setConfirmOpen(true)} type="button">
          {submitting ? 'Mengirim…' : 'Ajukan Peminjaman'}
          {!submitting && <ArrowRight size={16} aria-hidden="true" />}
        </Button>
      </div>

      <Modal className="workflow-modal" onClose={() => !submitting && setConfirmOpen(false)} open={confirmOpen} title="Kirim pengajuan peminjaman?">
        <p className="modal-copy">Pengajuan akan disimpan ke sistem dan tautan persetujuan dikirim ke email Pembina.</p>
        <div className="modal-actions">
          <Button disabled={submitting} onClick={() => setConfirmOpen(false)} type="button" variant="secondary">Periksa kembali</Button>
          <Button disabled={submitting} onClick={finishSubmission} type="button">{submitting ? 'Mengirim…' : 'Konfirmasi pengajuan'}</Button>
        </div>
      </Modal>
    </div>
  )
}

export default ApplicationConfirmationPage
