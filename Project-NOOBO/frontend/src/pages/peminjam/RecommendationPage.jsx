import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CircleAlert, Sparkles } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { formatTimeRange } from '../../utils/time-format.js'

function RecommendationPage() {
  const navigate = useNavigate()
  const {
    fsk,
    recommendations,
    selectedRoom,
    setSelectedRoom,
    setFskStep,
    clearRecommendations,
    selectPackage,
  } = useOutletContext()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [selectError, setSelectError] = useState('')

  if (!recommendations) {
    return (
      <div className="workflow-page">
        <Card className="workflow-card workflow-empty">
          <h1>Rekomendasi belum tersedia</h1>
          <p>Lengkapi FSK terlebih dahulu untuk melihat paket rekomendasi.</p>
          <Link className="text-link" to="/peminjam/ajukan">Isi FSK</Link>
        </Card>
      </div>
    )
  }

  const chosenPackage = recommendations.rooms.find((room) => room.id === selectedRoom) || recommendations.rooms[0]
  const activeLogistics = chosenPackage?.logistics || recommendations.logistics || []

  const confirmCancel = () => {
    clearRecommendations()
    setCancelOpen(false)
    navigate('/peminjam')
  }

  const continueToFpp = async () => {
    if (!selectedRoom || submitting) return
    setSelectError('')
    setSubmitting(true)
    try {
      await selectPackage(selectedRoom)
    } catch (error) {
      setSelectError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const hasSuitableOption = recommendations.rooms.some((room) => room.fits && room.available)

  return (
    <div className="workflow-page">
      <button className="workflow-back-link" onClick={() => navigate('/peminjam/ajukan')} type="button"><ArrowLeft size={17} aria-hidden="true" />Kembali ke FSK</button>
      <header className="workflow-heading">
        <p className="eyebrow">TAHAP 2 · REKOMENDASI</p>
        <h1>Pilihan paket untuk kegiatanmu</h1>
        <p className="page-description">Bandingkan paket rekomendasi berdasarkan kapasitas, ketersediaan jadwal, dan stok logistik.</p>
      </header>

      <div className="simulation-notice"><Sparkles size={17} aria-hidden="true" /><p>Paket disusun dari data ruangan dan stok aktual. Persetujuan akhir tetap memerlukan keputusan Pembina dan Logistik Kampus.</p></div>

      <Card className="recommendation-summary">
        <h2>Ringkasan kebutuhan</h2>
        <dl>
          <div><dt>Kegiatan</dt><dd>{fsk.eventName}</dd></div>
          <div><dt>Peserta</dt><dd>{fsk.participants} orang</dd></div>
          <div><dt>Jadwal</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div>
          <div><dt>Fasilitas</dt><dd>{activeLogistics.length ? activeLogistics.map(({ label, quantity, unit }) => `${label} (${quantity} ${unit})`).join(', ') : 'Tidak ada fasilitas tambahan dipilih'}</dd></div>
        </dl>
      </Card>

      <Button onClick={() => setCompareOpen(true)} type="button" variant="secondary">Bandingkan alternatif</Button>
      {!hasSuitableOption && <div className="simulation-notice"><CircleAlert size={17} aria-hidden="true" /><p>Belum ada paket ruangan yang sesuai kapasitas dan ketersediaan. Ubah kebutuhan untuk mencoba rekomendasi lain.</p></div>}

      <section className="workflow-section" aria-labelledby="room-options-title">
        <div className="workflow-section__heading"><div><p className="dashboard-section-kicker">PILIHAN PAKET RUANGAN</p><h2 id="room-options-title">Alternatif rekomendasi</h2></div><Badge tone="info">{recommendations.rooms.length} paket</Badge></div>
        <div className="recommendation-options">
          {recommendations.rooms.map((room, index) => (
            <label className={`recommendation-room ${selectedRoom === room.id ? 'is-selected' : ''} ${!room.available ? 'is-unavailable' : ''}`} key={room.id}>
              <input checked={selectedRoom === room.id} disabled={!room.available || !room.fits} name="recommended-room" onChange={() => { setSelectedRoom(room.id); setSelectError('') }} type="radio" />
              <span className="recommendation-room__content">
                <span className="recommendation-room__top">
                  <strong>{room.name}</strong>
                  {index === 0 && room.fits && room.available && <Badge tone="info">Paling sesuai · skor {room.score}</Badge>}
                  {index > 0 && <Badge tone="neutral">Skor {room.score}</Badge>}
                </span>
                <span className="recommendation-room__meta">{room.building} · Kapasitas {room.capacity} orang</span>
                <span className="recommendation-room__status">
                  <Badge tone={room.fits ? 'success' : 'warning'}>{room.fits ? 'Kapasitas sesuai' : 'Kapasitas terbatas'}</Badge>
                  <Badge tone={room.available ? 'info' : 'warning'}>{room.available ? 'Tersedia pada jadwal' : 'Tidak tersedia'}</Badge>
                </span>
                <span className="recommendation-room__reason">{room.reason}</span>
                <details className="recommendation-room__details"><summary>Fasilitas bawaan</summary><span>{room.equipment.length ? room.equipment.join(', ') : 'Tidak ada catatan fasilitas bawaan.'}</span></details>
              </span>
              {selectedRoom === room.id && <Check className="recommendation-room__check" size={19} aria-hidden="true" />}
            </label>
          ))}
        </div>
      </section>

      <section className="workflow-section" aria-labelledby="logistics-title">
        <div className="workflow-section__heading"><div><p className="dashboard-section-kicker">KEBUTUHAN LOGISTIK</p><h2 id="logistics-title">Barang dalam paket</h2></div></div>
        {activeLogistics.length === 0 ? (
          <Card className="workflow-card"><p className="workflow-card__description">Tidak ada barang tambahan yang diminta pada FSK.</p></Card>
        ) : (
          <Card className="recommendation-logistics">
            {activeLogistics.map((item) => {
              const sufficient = item.availableStock >= item.quantity
              return (
                <div className="recommendation-logistics__row" key={item.id}>
                  <span><strong>{item.label}</strong><small>Diminta: {item.quantity} {item.unit}</small></span>
                  <Badge tone={sufficient ? 'info' : 'warning'}>Tersedia {item.availableStock} {item.unit}</Badge>
                </div>
              )
            })}
          </Card>
        )}
      </section>

      {selectError && <p className="logistik-error" role="alert">{selectError}</p>}

      <div className="recommendation-actions">
        {!selectedRoom && <p className="recommendation-actions__hint"><CircleAlert size={15} aria-hidden="true" />Pilih satu paket ruangan untuk melanjutkan.</p>}
        <Button disabled={!selectedRoom || submitting} onClick={continueToFpp} type="button">
          {submitting ? 'Memverifikasi ketersediaan…' : 'Dokumen & Pembina'}
          {!submitting && <ArrowRight size={16} aria-hidden="true" />}
        </Button>
        <Button onClick={() => { setFskStep(0); navigate('/peminjam/ajukan', { state: { from: '/peminjam/ajukan/rekomendasi' } }) }} type="button" variant="secondary">Ubah Kebutuhan</Button>
        <Button onClick={() => setCancelOpen(true)} type="button" variant="tertiary">Batalkan</Button>
      </div>

      <Modal className="workflow-modal" onClose={() => setCancelOpen(false)} open={cancelOpen} title="Batalkan rekomendasi?">
        <p className="modal-copy">Proses rekomendasi ini akan diakhiri dan kamu kembali ke Dashboard.</p>
        <div className="modal-actions">
          <Button onClick={() => setCancelOpen(false)} type="button" variant="secondary">Tetap di sini</Button>
          <Button onClick={confirmCancel} type="button" variant="destructive">Batalkan rekomendasi</Button>
        </div>
      </Modal>
      <Modal className="workflow-modal" onClose={() => setCompareOpen(false)} open={compareOpen} title="Perbandingan paket rekomendasi">
        <div className="recommendation-comparison">
          {recommendations.rooms.map((room) => (
            <Card key={room.id}>
              <h3>{room.name} (Skor {room.score})</h3>
              <p>{room.building} · {room.capacity} orang · Kondisi {room.condition}</p>
              <p>{room.reason}</p>
              <p>Fasilitas ruangan: {room.equipment.join(', ') || 'Tidak tercatat'}</p>
              <p>Logistik paket: {(room.logistics || []).map((item) => `${item.label} (${item.quantity} ${item.unit})`).join(', ') || 'Tidak ada'}</p>
            </Card>
          ))}
        </div>
      </Modal>
    </div>
  )
}

export default RecommendationPage
