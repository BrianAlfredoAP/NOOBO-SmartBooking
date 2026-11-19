import { useState } from 'react'
import { ArrowLeft, ArrowRight, ClipboardList } from 'lucide-react'
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Time24Input from '../../components/ui/Time24Input.jsx'
import { demoEquipment } from '../../data/peminjam-demo.js'
import { validateFskStep } from '../../utils/peminjam-workflow.js'
import { formatTimeRange } from '../../utils/time-format.js'
import StageProgress from '../../components/common/StageProgress.jsx'

const stages = ['Data & kegiatan', 'Jadwal', 'Fasilitas']

function FskPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fsk, setFsk, fskStep, setFskStep, generateRecommendations, clearRecommendations } = useOutletContext()
  const [errors, setErrors] = useState({})
  const updateField = (name, value) => {
    if (location.state?.from === '/peminjam/ajukan/rekomendasi') clearRecommendations()
    if (name === 'date') setFsk({ date: value, ...(!fsk.endDate || fsk.endDate === fsk.date ? { endDate: value } : {}) })
    else setFsk({ [name]: value })
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }))
  }

  const updateEquipment = (id, value) => {
    if (location.state?.from === '/peminjam/ajukan/rekomendasi') clearRecommendations()
    setFsk({ equipment: { ...fsk.equipment, [id]: value } })
  }

  const continueStep = (event) => {
    event.preventDefault()
    const nextErrors = validateFskStep(fskStep, fsk)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    if (fskStep < stages.length - 1) setFskStep(fskStep + 1)
    else generateRecommendations()
  }

  const goBack = () => {
    setErrors({})
    if (fskStep > 0) setFskStep(fskStep - 1)
    else navigate(location.state?.from || '/peminjam')
  }

  const selectedEquipment = demoEquipment.filter(({ id }) => Number(fsk.equipment[id]) > 0)

  return (
    <div className="workflow-page">
      <Link className="workflow-back-link" to="/peminjam"><ArrowLeft size={17} aria-hidden="true" />Dashboard</Link>
      <header className="workflow-heading">
        <p className="eyebrow">FORM SPESIFIKASI KEBUTUHAN</p>
        <h1>Ajukan Peminjaman</h1>
        <p className="page-description">Lengkapi kebutuhan kegiatan untuk melihat pilihan ruangan dan logistik.</p>
      </header>

      <StageProgress activeIndex={fskStep} stages={stages} label="Tahapan pengisian FSK" />

      <form className="workflow-form" noValidate onSubmit={continueStep}>
        {fskStep === 0 && (
          <>
            <Card className="workflow-card">
              <div className="workflow-card__heading"><span className="workflow-card__icon"><ClipboardList size={19} aria-hidden="true" /></span><div><h2>Data peminjam</h2><p>Data demo dapat disesuaikan sebelum melanjutkan.</p></div></div>
              <div className="workflow-fields">
                <Input error={errors.borrowerName} label="Nama lengkap" onChange={(event) => updateField('borrowerName', event.target.value)} required value={fsk.borrowerName} />
                <Input error={errors.organization} label="Organisasi atau unit kegiatan" onChange={(event) => updateField('organization', event.target.value)} required value={fsk.organization} />
                <Input autoComplete="tel" hint="Opsional untuk kebutuhan kontak." label="Nomor WhatsApp" onChange={(event) => updateField('whatsapp', event.target.value)} type="tel" value={fsk.whatsapp} />
              </div>
            </Card>
            <Card className="workflow-card">
              <h2>Informasi kegiatan</h2>
              <div className="workflow-fields">
                <Input error={errors.eventName} label="Nama kegiatan" onChange={(event) => updateField('eventName', event.target.value)} required value={fsk.eventName} />
                <label className="form-field" htmlFor="event-purpose">
                  <span className="form-field__label">Tujuan atau informasi kegiatan</span>
                  <textarea id="event-purpose" className="form-control workflow-textarea" maxLength={500} onChange={(event) => updateField('purpose', event.target.value)} value={fsk.purpose} />
                  <span className={`form-field__message ${errors.purpose ? 'form-field__message--error' : ''}`}>{errors.purpose || `Wajib diisi · ${fsk.purpose.length}/500 karakter`}</span>
                </label>
              </div>
            </Card>
          </>
        )}

        {fskStep === 1 && (
          <Card className="workflow-card">
            <h2>Jumlah peserta dan jadwal</h2>
            <div className="workflow-fields">
              <Input error={errors.participants} label="Jumlah peserta" min="1" max="10000" onChange={(event) => updateField('participants', event.target.value)} required type="number" value={fsk.participants} />
              <Input error={errors.date} label="Tanggal mulai kegiatan" onChange={(event) => updateField('date', event.target.value)} required type="date" value={fsk.date} />
              <Input error={errors.endDate} label="Tanggal selesai kegiatan" onChange={(event) => updateField('endDate', event.target.value)} required type="date" value={fsk.endDate} />
              <div className="workflow-time-grid">
                <Time24Input error={errors.startTime} label="Waktu mulai" onChange={(value) => updateField('startTime', value)} required value={fsk.startTime} />
                <Time24Input error={errors.endTime} label="Waktu selesai" onChange={(value) => updateField('endTime', value)} required value={fsk.endTime} />
              </div>
            </div>
          </Card>
        )}

        {fskStep === 2 && (
          <>
            <Card className="workflow-card">
              <h2>Fasilitas dan barang yang dibutuhkan</h2>
              <p className="workflow-card__description">Daftar inventaris ini adalah data simulasi, bukan ketersediaan kampus yang terverifikasi.</p>
              <div className="equipment-list">
                {demoEquipment.map(({ id, label, unit }) => {
                  const chosen = Number(fsk.equipment[id]) > 0
                  return (
                    <div className={`equipment-row ${chosen ? 'is-selected' : ''}`} key={id}>
                      <label className="equipment-row__choice">
                        <input checked={chosen} onChange={(event) => updateEquipment(id, event.target.checked ? 1 : '')} type="checkbox" />
                        <span>{label}</span>
                      </label>
                      {chosen && id !== 'lainnya' && (
                        <label className="equipment-quantity">
                          <span>Jumlah</span>
                          <input aria-label={`Jumlah ${label}`} aria-invalid={Boolean(errors[`equipment_${id}`])} max="999" min="1" onChange={(event) => updateEquipment(id, event.target.value)} type="number" value={fsk.equipment[id]} />
                          <small>{unit}</small>
                          {errors[`equipment_${id}`] && <small className="form-field__message--error">{errors[`equipment_${id}`]}</small>}
                        </label>
                      )}
                    </div>
                  )
                })}
              </div>
              {fsk.equipment.lainnya && <Input error={errors.otherEquipment} hint="Sebutkan fasilitas atau barang yang dimaksud." label="Keterangan lainnya" maxLength={100} onChange={(event) => updateField('otherEquipment', event.target.value)} required value={fsk.otherEquipment} />}
            </Card>
            <Card className="workflow-card">
              <label className="form-field" htmlFor="special-needs">
                <span className="form-field__label">Kebutuhan khusus atau catatan tambahan</span>
                <textarea id="special-needs" className="form-control workflow-textarea" maxLength={500} onChange={(event) => updateField('specialNeeds', event.target.value)} value={fsk.specialNeeds} />
                <span className="form-field__message">Opsional · {fsk.specialNeeds.length}/500 karakter</span>
              </label>
            </Card>
            <Card className="fsk-summary">
              <h2>Ringkasan kebutuhan</h2>
              <dl>
                <div><dt>Kegiatan</dt><dd>{fsk.eventName}</dd></div>
                <div><dt>Peserta</dt><dd>{fsk.participants} orang</dd></div>
                <div><dt>Jadwal</dt><dd>{fsk.date}{fsk.endDate && fsk.endDate !== fsk.date ? ` – ${fsk.endDate}` : ''} · {formatTimeRange(fsk.startTime, fsk.endTime)}</dd></div>
                <div><dt>Fasilitas</dt><dd>{selectedEquipment.length ? selectedEquipment.map((item) => item.label).join(', ') : 'Belum memilih fasilitas tambahan'}</dd></div>
              </dl>
            </Card>
          </>
        )}

        <div className="workflow-actions">
          <Button onClick={goBack} type="button" variant="secondary">Kembali</Button>
          <Button type="submit">{fskStep === stages.length - 1 ? 'Lihat Rekomendasi' : 'Lanjut'}<ArrowRight size={16} aria-hidden="true" /></Button>
        </div>
      </form>
      <p className="demo-disclaimer">Data dan proses pada halaman ini merupakan simulasi frontend.</p>
    </div>
  )
}

export default FskPage
