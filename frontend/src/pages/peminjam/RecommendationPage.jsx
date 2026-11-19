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
    fsk, recommendations, selectedRoom, setSelectedRoom,
    selectedLogistics, setSelectedLogistics, setFskStep, clearRecommendations,
  } = useOutletContext()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)

  if (!recommendations) {
    return (
      <div className="workflow-page">
        <Card className="workflow-card workflow-empty">
          <h1>Rekomendasi belum tersedia</h1>
          <p>Lengkapi FSK terlebih dahulu untuk melihat alternatif simulasi.</p>
          <Link className="text-link" to="/peminjam/ajukan">Isi FSK</Link>
        </Card>
      </div>
    )
  }

  const toggleLogistics = (id) => setSelectedLogistics((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id])

  const confirmCancel = () => {
    clearRecommendations()
    setCancelOpen(false)
    navigate('/peminjam')
  }

  const continueToFpp = () => {
    if (selectedRoom) navigate('/peminjam/ajukan/fpp')
  }
  const hasSuitableOption = recommendations.rooms.some((room) => room.fits && room.available)

  return (
    <div className="workflow-page">
      <button className="workflow-back-link" onClick={() => navigate('/peminjam/ajukan')} type="button"><ArrowLeft size={17} aria-hidden="true" />Kembali ke FSK</button>
      <header className="workflow-heading">
        <p className="eyebrow">TAHAP 2 · REKOMENDASI</p>
        <h1>Pilihan untuk kegiatanmu</h1>
        <p className="page-description">Bandingkan alternatif dan pilih yang paling sesuai. Kamu tetap bebas mengubah kebutuhan.</p>
      </header>

      <div className="simulation-notice"><Sparkles size={17} aria-hidden="true" /><p>Rekomendasi ini adalah simulasi frontend dari data contoh. Keputusan tetap memerlukan pemeriksaan Pembina dan Logistik Kampus.</p></div>

      <Card className="recommendation-summary">
        <h2>Ringkasan kebutuhan</h2>
        <dl>
          <div><dt>Kegiatan</dt><dd>{fsk.eventName}</dd></div>
          <div><dt>Peserta</dt><dd>{fsk.participants} orang</dd></div>
          <div><dt>Jadwal</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div>
          <div><dt>Fasilitas</dt><dd>{recommendations.logistics.filter(({ id }) => selectedLogistics.includes(id)).length ? recommendations.logistics.filter(({ id }) => selectedLogistics.includes(id)).map(({ label }) => label).join(', ') : 'Tidak ada fasilitas tambahan dipilih'}</dd></div>
        </dl>
      </Card>

      <Button onClick={() => setCompareOpen(true)} type="button" variant="secondary">Bandingkan alternatif</Button>
      {!hasSuitableOption && <div className="simulation-notice"><CircleAlert size={17} aria-hidden="true"/><p>Belum ada ruangan simulasi yang sesuai kapasitas dan ketersediaan. Ubah kebutuhan untuk mencoba rekomendasi lain.</p></div>}

      <section className="workflow-section" aria-labelledby="room-options-title">
        <div className="workflow-section__heading"><div><p className="dashboard-section-kicker">PILIHAN RUANGAN</p><h2 id="room-options-title">Alternatif rekomendasi</h2></div><Badge tone="info">{recommendations.rooms.length} opsi</Badge></div>
        <div className="recommendation-options">
          {recommendations.rooms.map((room, index) => (
            <label className={`recommendation-room ${selectedRoom === room.id ? 'is-selected' : ''} ${!room.available ? 'is-unavailable' : ''}`} key={room.id}>
              <input checked={selectedRoom === room.id} disabled={!room.available || !room.fits} name="recommended-room" onChange={() => setSelectedRoom(room.id)} type="radio" />
              <span className="recommendation-room__content">
                <span className="recommendation-room__top"><strong>{room.name}</strong>{index === 0 && room.fits && room.available && <Badge tone="info">Paling sesuai</Badge>}</span>
                <span className="recommendation-room__meta">{room.building} · Kapasitas {room.capacity} orang</span>
                <span className="recommendation-room__status"><Badge tone={room.fits ? 'success' : 'warning'}>{room.fits ? 'Kapasitas sesuai' : 'Kapasitas terbatas'}</Badge><Badge tone={room.available ? 'info' : 'warning'}>{room.available ? 'Tersedia · simulasi' : 'Tidak tersedia · simulasi'}</Badge></span>
                <span className="recommendation-room__reason">{room.reason}</span>
                <details className="recommendation-room__details"><summary>Fasilitas bawaan</summary><span>{room.equipment.length ? room.equipment.join(', ') : 'Informasi fasilitas tidak tersedia pada data demo.'}</span></details>
              </span>
              {selectedRoom === room.id && <Check className="recommendation-room__check" size={19} aria-hidden="true" />}
            </label>
          ))}
        </div>
      </section>

      <section className="workflow-section" aria-labelledby="logistics-title">
        <div className="workflow-section__heading"><div><p className="dashboard-section-kicker">KEBUTUHAN LOGISTIK</p><h2 id="logistics-title">Pilih barang yang diperlukan</h2></div></div>
        {recommendations.logistics.length === 0 ? (
          <Card className="workflow-card"><p className="workflow-card__description">Tidak ada barang tambahan yang dipilih pada FSK.</p></Card>
        ) : (
          <Card className="recommendation-logistics">
            {recommendations.logistics.map((item) => {
              const selected = selectedLogistics.includes(item.id)
              const sufficient = item.simulatedStock === null || item.simulatedStock >= item.quantity
              return (
                <label className="recommendation-logistics__row" key={item.id}>
                  <input checked={selected} onChange={() => toggleLogistics(item.id)} type="checkbox" />
                  <span><strong>{item.label}</strong><small>Diminta: {item.quantity} {item.unit}</small></span>
                  <Badge tone={sufficient ? 'info' : 'warning'}>{item.simulatedStock === null ? 'Perlu verifikasi' : `${item.simulatedStock} ${item.unit} · demo`}</Badge>
                </label>
              )
            })}
            <p className="workflow-card__description">Stok yang ditampilkan hanya data contoh, belum terverifikasi.</p>
          </Card>
        )}
      </section>

      <div className="recommendation-actions">
        {!selectedRoom && <p className="recommendation-actions__hint"><CircleAlert size={15} aria-hidden="true" />Pilih satu ruangan untuk melanjutkan.</p>}
        <Button disabled={!selectedRoom} onClick={continueToFpp} type="button">Dokumen &amp; Pembina<ArrowRight size={16} aria-hidden="true" /></Button>
        <Button onClick={() => { setFskStep(0); navigate('/peminjam/ajukan', { state: { from: '/peminjam/ajukan/rekomendasi' } }) }} type="button" variant="secondary">Ubah Kebutuhan</Button>
        <Button onClick={() => setCancelOpen(true)} type="button" variant="tertiary">Batalkan</Button>
      </div>

      <Modal className="workflow-modal" onClose={() => setCancelOpen(false)} open={cancelOpen} title="Batalkan rekomendasi?">
        <p className="modal-copy">Proses rekomendasi ini akan diakhiri dan kamu kembali ke Dashboard. Isian FSK tetap tersedia selama sesi ini.</p>
        <div className="modal-actions">
          <Button onClick={() => setCancelOpen(false)} type="button" variant="secondary">Tetap di sini</Button>
          <Button onClick={confirmCancel} type="button" variant="destructive">Batalkan rekomendasi</Button>
        </div>
      </Modal>
      <Modal className="workflow-modal" onClose={() => setCompareOpen(false)} open={compareOpen} title="Perbandingan alternatif simulasi">
        <div className="recommendation-comparison">{recommendations.rooms.map((room) => <Card key={room.id}><h3>{room.name}</h3><p>{room.building} · {room.capacity} orang</p><p>{room.fits ? 'Kapasitas sesuai' : 'Kapasitas tidak mencukupi'} · {room.available ? 'Tersedia dalam data demo' : 'Tidak tersedia dalam data demo'}</p><p>Fasilitas ruangan: {room.equipment.join(', ') || 'Tidak tercatat'}</p><p>Logistik pilihan: {recommendations.logistics.filter((item) => selectedLogistics.includes(item.id)).map((item) => `${item.label} (${item.quantity} ${item.unit})`).join(', ') || 'Tidak ada'}</p></Card>)}</div>
      </Modal>
    </div>
  )
}

export default RecommendationPage
