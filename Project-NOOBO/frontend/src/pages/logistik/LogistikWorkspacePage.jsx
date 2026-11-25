import { useEffect, useState } from 'react'
import AboutBrand from '../../components/layout/AboutBrand.jsx'
import {
  ArrowLeft,
  ArrowRight,
  Boxes,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  Info,
  LogOut,
  Package,
  PackageCheck,
  Plus,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  XCircle,
} from 'lucide-react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Input from '../../components/ui/Input.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Select from '../../components/ui/Select.jsx'
import StageProgress from '../../components/common/StageProgress.jsx'
import { formatTimeRange } from '../../utils/time-format.js'
import { isAwaitingLogistics } from '../../utils/logistik-workflow.js'
import { apiGetLogisticsRequestDetail } from '../../api/client.js'

const roomStages = ['Informasi', 'Fasilitas', 'Konfirmasi']
const inventoryStages = ['Informasi', 'Stok & kondisi', 'Konfirmasi']
const logisticTabs = [
  { id: 'semua', label: 'Semua' },
  { id: 'pending', label: 'Menunggu Logistik' },
  { id: 'approved', label: 'Disetujui' },
  { id: 'rejected', label: 'Ditolak' },
  { id: 'done', label: 'Selesai' },
]

function BackLink({ to, label = 'Kembali' }) {
  return <Link className="workflow-back-link" to={to}><ArrowLeft size={17} />{label}</Link>
}

function PageTitle({ eyebrow = 'AREA LOGISTIK', title, description }) {
  return (
    <header className="workflow-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description && <p className="page-description">{description}</p>}
    </header>
  )
}

function InfoRows({ rows }) {
  return (
    <dl className="confirmation-details">
      {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '-'}</dd></div>)}
    </dl>
  )
}

function StatusBadge({ status }) {
  const tone = /Disetujui|Selesai|Baik|Tersedia|Dipinjam/i.test(status || '')
    ? 'success'
    : /Ditolak|Perlu Perbaikan|Rusak|Hilang|Tidak tersedia|Batal/i.test(status || '')
      ? 'danger'
      : 'warning'
  return <Badge tone={tone}>{status}</Badge>
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function requestDate(record) {
  return record.event?.endDate || record.event?.date || ''
}

function formatDashboardDate(value) {
  if (!value) return 'Tanggal belum tersedia'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(date)
}

function Dashboard({ ctx }) {
  const { rooms, inventory, requests, dataError } = ctx
  const ready = requests.filter((request) => isAwaitingLogistics(request)).length
  const pendingInspection = requests.filter((request) => request.status_code === 'RETURN_REPORTED')
  const latest = requests.slice(0, 3)
  const attention = inventory.filter((item) => item.stock <= 2 || item.condition !== 'Baik')
  const inventorySummary = (attention.length ? attention : inventory).slice(0, 3)
  const totalInventoryUnits = inventory.reduce((sum, item) => sum + Number(item.stock || 0), 0)

  return (
    <div className="logistik-page logistik-home">
      <PageTitle eyebrow="AREA LOGISTIK KAMPUS" title={`Halo, ${ctx.profile.name}`} description="Ringkasan operasional dan pemeriksaan fasilitas kampus." />
      <div className="logistik-greeting">
        <span className="dashboard-avatar">{ctx.profile.initials}</span>
        <div><strong>{ctx.profile.roleLabel}</strong><small>{ctx.profile.unit}</small></div>
      </div>
      {dataError && <p className="logistik-error" role="alert">{dataError}</p>}
      <section className="logistik-metrics" aria-label="Ringkasan operasional">
        <Link className="metric-room" to="/logistik/ruangan"><span className="logistik-metric-icon"><Building2 size={19} /></span><span className="logistik-metric-label">Ruangan</span><strong>{rooms.length}</strong><small>data fasilitas</small></Link>
        <Link className="metric-inventory" to="/logistik/inventaris"><span className="logistik-metric-icon"><Boxes size={19} /></span><span className="logistik-metric-label">Inventaris</span><strong>{inventory.length}</strong><small>jenis barang · {totalInventoryUnits} unit</small></Link>
        <Link className="metric-applications" to="/logistik/pengajuan?status=pending"><span className="logistik-metric-icon"><ClipboardList size={19} /></span><span className="logistik-metric-label">Perlu diproses</span><strong>{ready}</strong><small>menunggu tindak lanjut</small></Link>
        <Link className="metric-returns" to="/logistik/pemeriksaan"><span className="logistik-metric-icon"><PackageCheck size={19} /></span><span className="logistik-metric-label">Pengembalian</span><strong>{pendingInspection.length}</strong><small>laporan perlu diperiksa</small></Link>
      </section>
      <section className="logistik-section">
        <div className="logistik-section__title"><h2>Pengajuan Terbaru</h2><Link to="/logistik/pengajuan">Lihat semua</Link></div>
        {latest.length ? (
          <div className="logistik-home-list">
            {latest.map((item) => (
              <Link className="logistik-list-row logistik-home-request" key={item.id} to={`/logistik/pengajuan/${item.id}`}>
                <span className="logistik-row-icon"><ClipboardList size={19} /></span>
                <span className="logistik-home-row-copy">
                  <strong>{item.event?.name || 'Kegiatan tanpa nama'}</strong>
                  <small>{item.borrower?.name || 'Peminjam'}</small>
                  <small>{formatDashboardDate(item.event?.date)}</small>
                  <StatusBadge status={item.status} />
                </span>
                <ChevronRight aria-hidden="true" className="logistik-home-row-arrow" size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="logistik-empty logistik-home-empty">Belum ada pengajuan.</div>
        )}
      </section>
      <section className="logistik-section">
        <div className="logistik-section__title">
          <div className="logistik-home-section-heading"><h2>Perlu Diperiksa</h2><span className="logistik-section-count">{pendingInspection.length}</span></div>
          <Link to="/logistik/pemeriksaan">Lihat semua</Link>
        </div>
        {pendingInspection.length ? (
          <div className="logistik-home-list">
            {pendingInspection.slice(0, 3).map((item) => (
              <Link className="logistik-list-row logistik-home-inspection" key={item.id} to={`/logistik/pemeriksaan/${item.id}`}>
                <span className="logistik-row-icon"><ClipboardCheck size={19} /></span>
                <span className="logistik-home-row-copy">
                  <strong>{item.event?.name || `Transaksi ${item.id}`}</strong>
                  <small>{item.borrower?.name || 'Peminjam'} · {item.nomor_pengajuan || item.id}</small>
                  <StatusBadge status={item.status} />
                </span>
                <ChevronRight aria-hidden="true" className="logistik-home-row-arrow" size={18} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="logistik-empty logistik-home-empty">
            <span className="logistik-empty-icon"><ClipboardCheck size={19} /></span>
            <span>Belum ada laporan pengembalian yang perlu diperiksa.</span>
          </div>
        )}
      </section>
      <section className="logistik-section">
        <div className="logistik-section__title">
          <div className="logistik-home-section-heading"><h2>Ringkasan Inventaris</h2><span className="logistik-section-caption">{inventory.length} jenis</span></div>
          <Link to="/logistik/inventaris">Lihat semua</Link>
        </div>
        {inventorySummary.length ? (
          <div className="logistik-home-list">
            {inventorySummary.map((item) => (
              <div className="inventory-attention logistik-home-inventory" key={item.id}>
                <span className="inventory-attention__icon"><Boxes size={18} /></span>
                <span className="logistik-home-inventory-copy">
                  <strong>{item.name}</strong>
                  <small>Stok {item.stock} {item.unit} · {item.condition}</small>
                </span>
                <Badge className="logistik-home-availability" tone={item.available ? 'success' : 'neutral'}>{item.available ? 'Tersedia' : 'Tidak tersedia'}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="logistik-empty logistik-home-empty">Belum ada data inventaris.</div>
        )}
      </section>
    </div>
  )
}

function DataHome() {
  return (
    <div className="logistik-page">
      <PageTitle eyebrow="DATA FASILITAS" title="Data" description="Kelola ruangan dan inventaris Logistik Kampus." />
      <div className="logistik-data-options">
        <Link className="logistik-data-option" to="/logistik/ruangan"><span><Building2 size={21} /></span><strong>Data Ruangan</strong><small>Kelola ruang, kapasitas, dan fasilitas.</small><ChevronRight size={18} /></Link>
        <Link className="logistik-data-option" to="/logistik/inventaris"><span><Boxes size={21} /></span><strong>Inventaris</strong><small>Kelola stok dan kondisi barang.</small><ChevronRight size={18} /></Link>
      </div>
    </div>
  )
}

function ResourceEditor({ kind, initialValue, onSave, onClose }) {
  const isRoom = kind === 'room'
  const stages = isRoom ? roomStages : inventoryStages
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [form, setForm] = useState(() => initialValue || (isRoom
    ? { name: '', code: '', building: '', floor: '', category: '', capacity: '', equipment: [], available: true, condition: 'Baik', description: '', photo: '' }
    : { name: '', category: '', code: '', stock: '', unit: 'unit', condition: 'Baik', location: 'Gudang Logistik', available: true, description: '', photo: '' }))

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: '' }))
  }

  const validate = () => {
    const next = {}
    if (step === 0) {
      if (!form.name?.trim()) next.name = 'Nama wajib diisi.'
      if (!isRoom && !form.category?.trim()) next.category = 'Kategori wajib diisi.'
      if (isRoom && !form.code?.trim()) next.code = 'Kode ruang wajib diisi.'
      if (isRoom && !form.building?.trim()) next.building = 'Gedung wajib diisi.'
    }
    if (step === 1) {
      if (isRoom && (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1)) next.capacity = 'Kapasitas harus bilangan positif.'
      if (!isRoom && (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 1)) next.stock = 'Stok harus berupa bilangan bulat minimal 1.'
    }
    setErrors(next)
    return !Object.keys(next).length
  }

  const advance = () => {
    if (!validate()) return
    if (step < stages.length - 1) setStep(step + 1)
    else onSave({ ...form, capacity: Number(form.capacity) || 0, stock: Number(form.stock) || 0 })
  }

  const toggleEquipment = (value) => update('equipment', form.equipment.includes(value) ? form.equipment.filter((item) => item !== value) : [...form.equipment, value])

  return (
    <Modal className="logistik-editor-modal" onClose={onClose} open title={`${initialValue ? 'Ubah' : 'Tambah'} ${isRoom ? 'ruangan' : 'inventaris'}`}>
      <div className="logistik-editor">
        <StageProgress activeIndex={step} stages={stages} label="Tahapan formulir" />
        <div className="logistik-editor__body">
          {step === 0 && (
            <>
              <Input error={errors.name} label={isRoom ? 'Nama ruangan' : 'Nama barang'} onChange={(event) => update('name', event.target.value)} required value={form.name} />
              {isRoom ? (
                <>
                  <Input error={errors.code} label="Kode ruangan" onChange={(event) => update('code', event.target.value)} required value={form.code} />
                  <Input error={errors.building} label="Gedung" onChange={(event) => update('building', event.target.value)} required value={form.building} />
                  <Input label="Lantai" onChange={(event) => update('floor', event.target.value)} value={form.floor} />
                  <Input label="Kategori ruangan" onChange={(event) => update('category', event.target.value)} value={form.category} />
                </>
              ) : (
                <>
                  <Input error={errors.category} label="Kategori" onChange={(event) => update('category', event.target.value)} required value={form.category} />
                  <Input label="Kode inventaris" onChange={(event) => update('code', event.target.value)} value={form.code} />
                  <Input label="Satuan" onChange={(event) => update('unit', event.target.value)} value={form.unit} />
                  <Input label="Lokasi penyimpanan" onChange={(event) => update('location', event.target.value)} value={form.location} />
                </>
              )}
            </>
          )}
          {step === 1 && (
            isRoom ? (
              <>
                <Input error={errors.capacity} label="Kapasitas (orang)" min="1" onChange={(event) => update('capacity', event.target.value)} required type="number" value={form.capacity} />
                <fieldset className="logistik-check-options">
                  <legend>Fasilitas bawaan</legend>
                  {['AC', 'Proyektor', 'Mikrofon', 'Sound system', 'Papan tulis', 'Kursi'].map((item) => (
                    <label key={item}><input checked={form.equipment.includes(item)} onChange={() => toggleEquipment(item)} type="checkbox" />{item}</label>
                  ))}
                </fieldset>
                <label className="form-field">
                  <span className="form-field__label">Kondisi</span>
                  <select className="form-control" onChange={(event) => update('condition', event.target.value)} value={form.condition}>
                    <option>Baik</option><option>Sangat Baik</option><option>Cukup</option><option>Rusak</option>
                  </select>
                </label>
                {initialValue && (
                  <label className="form-field">
                    <span className="form-field__label">Ketersediaan</span>
                    <select className="form-control" onChange={(event) => update('available', event.target.value === 'true')} value={String(form.available)}>
                      <option value="true">Tersedia</option><option value="false">Tidak tersedia</option>
                    </select>
                  </label>
                )}
              </>
            ) : (
              <>
                <Input error={errors.stock} label="Jumlah stok" min="1" onChange={(event) => update('stock', event.target.value)} required type="number" value={form.stock} />
                <label className="form-field">
                  <span className="form-field__label">Kondisi</span>
                  <select className="form-control" onChange={(event) => update('condition', event.target.value)} value={form.condition}>
                    <option>Baik</option><option>Sangat Baik</option><option>Cukup</option><option>Rusak</option>
                  </select>
                </label>
                <label className="form-field">
                  <span className="form-field__label">Ketersediaan</span>
                  <select className="form-control" onChange={(event) => update('available', event.target.value === 'true')} value={String(form.available)}>
                    <option value="true">Tersedia</option><option value="false">Tidak tersedia</option>
                  </select>
                </label>
              </>
            )
          )}
          {step === 2 && (
            <Card className="logistik-confirm-card">
              <h3>Konfirmasi data</h3>
              <InfoRows rows={isRoom
                ? [['Nama', form.name], ['Kode', form.code], ['Lokasi', `${form.building}${form.floor ? ` · lantai ${form.floor}` : ''}`], ['Kapasitas', `${form.capacity} orang`], ['Fasilitas', form.equipment.join(', ') || 'Belum dipilih'], ['Kondisi', form.condition]]
                : [['Barang', form.name], ['Kategori', form.category], ['Stok', `${form.stock} ${form.unit}`], ['Kondisi', form.condition], ['Lokasi', form.location]]}
              />
            </Card>
          )}
          <label className="form-field">
            <span className="form-field__label">Deskripsi (opsional)</span>
            <textarea className="form-control logistik-textarea" maxLength="300" onChange={(event) => update('description', event.target.value)} value={form.description} />
          </label>
        </div>
        <div className="logistik-editor__actions">
          <Button onClick={() => (step === 0 ? onClose() : setStep(step - 1))} variant="secondary">{step === 0 ? 'Batal' : 'Kembali'}</Button>
          <Button onClick={advance}>{step === stages.length - 1 ? 'Simpan' : 'Lanjut'}<ArrowRight size={15} /></Button>
        </div>
      </div>
    </Modal>
  )
}

function ResourceList({ kind, ctx }) {
  const isRoom = kind === 'room'
  const data = isRoom ? ctx.rooms : ctx.inventory
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [editor, setEditor] = useState(() => {
    const target = data.find((item) => item.id === location.state?.editId)
    return target ? { initial: target } : null
  })
  const [deleteItem, setDeleteItem] = useState(null)
  const [feedback, setFeedback] = useState('')

  const categories = [...new Set(data.map((item) => item.category).filter(Boolean))]
  const shown = data.filter((item) => (
    `${item.name} ${item.id} ${item.code || ''} ${item.category || ''} ${item.building || ''}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'Semua' || (filter === 'Tersedia' ? item.available : item.condition === filter || item.category === filter))
  ))

  const save = async (value) => {
    try {
      await ctx.saveResource(kind, value, editor.initial?.id)
      setFeedback(`${isRoom ? 'Data ruangan' : 'Data inventaris'} berhasil ${editor.initial ? 'diperbarui' : 'ditambahkan'}.`)
      setEditor(null)
    } catch (error) {
      setFeedback(error.message)
    }
  }

  const deleteResource = async () => {
    try {
      await ctx.deleteResource(kind, deleteItem.id)
      setFeedback(`${isRoom ? 'Ruangan' : 'Inventaris'} dinonaktifkan.`)
      setDeleteItem(null)
    } catch (error) {
      setFeedback(error.message)
      setDeleteItem(null)
    }
  }

  return (
    <div className="logistik-page">
      <BackLink to="/logistik/data" label="Data" />
      <PageTitle
        eyebrow={isRoom ? 'PENGELOLAAN FASILITAS' : 'PENGELOLAAN INVENTARIS'}
        title={isRoom ? 'Data Ruangan' : 'Inventaris Logistik'}
        description={isRoom ? 'Kelola kapasitas, fasilitas, kondisi, dan ketersediaan ruang.' : 'Pantau stok dan kondisi barang logistik kampus.'}
      />
      <div className="logistik-toolbar">
        <label className="workspace-search">
          <Search size={17} />
          <input aria-label={`Cari ${isRoom ? 'ruangan' : 'inventaris'}`} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau kode" value={query} />
        </label>
        <label className="logistik-filter">
          <span>Filter {isRoom ? 'status' : 'kategori / status'}</span>
          <select onChange={(event) => setFilter(event.target.value)} value={filter}>
            <option>Semua</option>
            {isRoom ? (
              <><option>Tersedia</option><option>Sangat Baik</option><option>Baik</option><option>Cukup</option><option>Rusak</option></>
            ) : (
              <>{categories.map((category) => <option key={category}>{category}</option>)}<option>Tersedia</option><option>Baik</option><option>Cukup</option><option>Rusak</option></>
            )}
          </select>
        </label>
      </div>
      <div className="logistik-list">
        {shown.length ? shown.map((item) => (
          <Card className="logistik-resource-row" key={item.id}>
            <div className="logistik-resource-row__main">
              {item.photo ? <img alt="" className="logistik-resource-photo" src={item.photo} /> : <span className="logistik-row-icon">{isRoom ? <Building2 size={19} /> : <Package size={19} />}</span>}
              <div>
                <h2>{item.name}</h2>
                <p>{isRoom ? `${item.building}${item.floor ? ` · lantai ${item.floor}` : ''} · ${item.capacity} orang` : `${item.category} · stok ${item.stock} ${item.unit}`}</p>
                <small>{isRoom ? item.code : item.location}</small>
                <StatusBadge status={item.available ? item.condition : 'Tidak tersedia'} />
              </div>
            </div>
            <div className="logistik-resource-actions">
              <Button onClick={() => navigate(`/logistik/${isRoom ? 'ruangan' : 'inventaris'}/${item.id}`, { state: { from: location.pathname } })} variant="secondary">Detail</Button>
              <Button onClick={() => setEditor({ initial: item })} variant="tertiary">Ubah</Button>
              <Button aria-label={`Hapus ${item.name}`} onClick={() => setDeleteItem(item)} variant="tertiary"><Trash2 size={16} /></Button>
            </div>
          </Card>
        )) : (
          <Card className="logistik-empty">Tidak ada data sesuai pencarian atau filter.</Card>
        )}
      </div>
      <Button className="logistik-add-button" onClick={() => { setFeedback(''); setEditor({ initial: null }) }}>
        <Plus size={18} />{isRoom ? 'Tambah Ruangan' : 'Tambah Inventaris'}
      </Button>
      {feedback && <p className="form-feedback" role="status">{feedback}</p>}
      {editor && <ResourceEditor initialValue={editor.initial} kind={kind} onClose={() => setEditor(null)} onSave={save} />}
      <Modal onClose={() => setDeleteItem(null)} open={Boolean(deleteItem)} title={`Nonaktifkan ${isRoom ? 'ruangan' : 'inventaris'}?`}>
        <p className="modal-copy">Data “{deleteItem?.name}” akan dinonaktifkan di sistem. Penghapusan ditolak otomatis bila masih terkait pengajuan aktif.</p>
        <div className="modal-actions">
          <Button onClick={() => setDeleteItem(null)} variant="secondary">Batal</Button>
          <Button onClick={deleteResource} variant="destructive">Nonaktifkan</Button>
        </div>
      </Modal>
    </div>
  )
}

function ResourceDetail({ kind, ctx }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isRoom = kind === 'room'
  const item = (isRoom ? ctx.rooms : ctx.inventory).find((value) => value.id === id)
  if (!item) return <div className="logistik-page"><BackLink to={location.state?.from || `/logistik/${isRoom ? 'ruangan' : 'inventaris'}`} /><Card><h2>Data tidak ditemukan</h2></Card></div>
  return (
    <div className="logistik-page">
      <BackLink to={location.state?.from || `/logistik/${isRoom ? 'ruangan' : 'inventaris'}`} />
      <PageTitle eyebrow={isRoom ? 'DETAIL RUANGAN' : 'DETAIL INVENTARIS'} title={item.name} />
      <Card className="logistik-detail-card">
        {item.photo ? <img alt={`Foto ${item.name}`} className="logistik-detail-photo" src={item.photo} /> : <span className="logistik-detail-icon">{isRoom ? <Building2 size={26} /> : <Package size={26} />}</span>}
        <InfoRows rows={isRoom
          ? [['Kode ruangan', item.code], ['Gedung', item.building], ['Lantai', item.floor], ['Kategori', item.category], ['Kapasitas', `${item.capacity} orang`], ['Fasilitas bawaan', item.equipment.join(', ')], ['Kondisi', item.condition], ['Status', item.available ? 'Tersedia' : 'Tidak tersedia'], ['Deskripsi', item.description]]
          : [['Kode inventaris', item.code || item.id], ['Kategori', item.category], ['Stok', `${item.stock} ${item.unit}`], ['Kondisi', item.condition], ['Lokasi', item.location], ['Status', item.available ? 'Tersedia' : 'Tidak tersedia'], ['Deskripsi', item.description]]}
        />
      </Card>
      <div className="logistik-detail-actions">
        <Button onClick={() => navigate(`/logistik/${isRoom ? 'ruangan' : 'inventaris'}`, { state: { editId: item.id } })} variant="secondary">Ubah Data</Button>
        <Button onClick={() => navigate(-1)} variant="tertiary">Kembali ke daftar</Button>
      </div>
    </div>
  )
}

function RequestList({ ctx }) {
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(new URLSearchParams(location.search).get('status') === 'pending' ? 'Menunggu Logistik' : 'Semua')
  const navigate = useNavigate()

  const visible = ctx.requests.filter((item) => (
    `${item.id} ${item.nomor_pengajuan || ''} ${item.event?.name || ''} ${item.borrower?.name || ''}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'Semua'
      || (filter === 'Menunggu Logistik'
        ? isAwaitingLogistics(item)
        : filter === 'Ditolak'
          ? item.status_code === 'REJECTED_LOGISTIK' || item.status_code === 'REJECTED_PEMBINA' || item.status_code === 'CANCELLED'
          : filter === 'Disetujui'
            ? item.status_code === 'APPROVED_LOGISTIK' || item.status_code === 'ONGOING' || item.status_code === 'RETURN_REPORTED'
            : item.status_code === 'COMPLETED'))
  ))

  return (
    <div className="logistik-page">
      <BackLink to="/logistik" label="Beranda" />
      <PageTitle eyebrow="TRANSAKSI PEMINJAMAN" title="Pengajuan Peminjaman" description="Periksa pengajuan yang masuk dan proses setelah persetujuan Pembina." />
      <label className="workspace-search">
        <Search size={17} />
        <input aria-label="Cari pengajuan" onChange={(event) => setQuery(event.target.value)} placeholder="Cari kegiatan, peminjam, atau nomor" value={query} />
      </label>
      <div className="logistik-status-filter">
        <Select className="logistik-select-control" label="Filter status" onChange={(event) => setFilter(event.target.value)} value={filter}>
          {logisticTabs.map((item) => <option key={item.id} value={item.label}>{item.label}</option>)}
        </Select>
      </div>
      <div className="logistik-list">
        {visible.length ? visible.map((item) => (
          <button className="logistik-request-card" key={item.id} onClick={() => navigate(`/logistik/pengajuan/${item.id}`, { state: { from: '/logistik/pengajuan' } })} type="button">
            <span className="logistik-row-icon"><ClipboardList size={18} /></span>
            <span className="logistik-request-card__body">
              <strong>{item.event?.name}</strong>
              <small>{item.borrower?.name} · {item.nomor_pengajuan || item.id}</small>
              <small>{item.event?.date} · {item.room?.name || 'Ruangan'}</small>
              <small>{item.event?.participants || 0} peserta</small>
              <StatusBadge status={item.status} />
            </span>
            <ChevronRight size={18} />
          </button>
        )) : (
          <Card className="logistik-empty">Tidak ada pengajuan yang sesuai filter.</Card>
        )}
      </div>
    </div>
  )
}

function RequestDetail({ ctx }) {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [decision, setDecision] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [actionFeedback, setActionFeedback] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)

  const loadDetail = async () => {
    setLoading(true)
    try {
      const data = await apiGetLogisticsRequestDetail(id)
      setDetail(data)
    } catch {
      setDetail(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    apiGetLogisticsRequestDetail(id)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch(() => {
        if (active) setDetail(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [id])

  const item = detail || ctx.requests.find((entry) => String(entry.id) === String(id))
  if (loading && !item) return <div className="logistik-page"><BackLink to={location.state?.from || '/logistik/pengajuan'} /><Card><p>Memuat detail pengajuan…</p></Card></div>
  if (!item) return <div className="logistik-page"><BackLink to={location.state?.from || '/logistik/pengajuan'} /><Card><h2>Pengajuan tidak ditemukan</h2></Card></div>

  const awaitingLogistics = item.status_code === 'WAITING_LOGISTIK' || item.status_code === 'REVISION_LOGISTIK'
  const waitingPembina = item.status_code === 'WAITING_PEMBINA' || item.status_code === 'SUBMITTED'
  const availability = item.availability
  const isAvailable = availability ? Boolean(availability.available) : true
  const issues = availability?.issues || []

  const commitDecision = async () => {
    if (submitting) return
    const code = decision === 'approve' ? 'APPROVE' : decision === 'reject' ? 'REJECT' : 'REVISION'
    if ((code === 'REJECT' || code === 'REVISION') && !note.trim()) {
      setError('Alasan wajib diisi untuk keputusan ini.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await ctx.submitDecision(item.id, code, note)
      setDecision('')
      setNote('')
      setActionFeedback('Keputusan Logistik berhasil disimpan.')
      await loadDetail()
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const publishDocument = async () => {
    if (submitting) return
    setSubmitting(true)
    setActionFeedback('')
    try {
      await ctx.issueSbp(item.id)
      setPublishOpen(false)
      setActionFeedback('SBP resmi berhasil diterbitkan.')
      await loadDetail()
    } catch (err) {
      setPublishOpen(false)
      setActionFeedback(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="logistik-page">
      <BackLink to={location.state?.from || '/logistik/pengajuan'} />
      <PageTitle eyebrow={`DETAIL PENGAJUAN · ${item.nomor_pengajuan || item.id}`} title={item.event?.name || 'Pengajuan'} description="Pemeriksaan Logistik dilakukan setelah keputusan Pembina." />
      <div className="logistik-detail-stack">
        <Card>
          <div className="logistik-card-heading"><h2>Status proses</h2><StatusBadge status={item.status} /></div>
          <InfoRows rows={[
            ['Pembina', item.supervisorStatus || item.pembina],
            ['Logistik Kampus', item.logisticsStatus || item.logistik],
            ['Catatan pemeriksaan', item.logisticsNote || item.rejectionReason || 'Belum ada catatan'],
            ['Nomor SBP', item.sbp?.nomor_sbp || 'Belum diterbitkan'],
          ]} />
        </Card>
        <Card>
          <h2>Informasi peminjam dan kegiatan</h2>
          <InfoRows rows={[
            ['Peminjam', item.borrower?.name],
            ['Email peminjam', item.borrower?.email],
            ['WhatsApp', item.borrower?.whatsapp || '-'],
            ['Email Pembina', item.supervisorEmail],
            ['Nama kegiatan', item.event?.name],
            ['Tujuan', item.event?.purpose],
            ['Peserta', `${item.event?.participants || 0} orang`],
            ['Jadwal', `${item.event?.date || ''}${item.event?.endDate && item.event.endDate !== item.event.date ? ` – ${item.event.endDate}` : ''} · ${formatTimeRange(item.event?.startTime, item.event?.endTime)}`],
          ]} />
        </Card>
        <Card>
          <h2>Ruangan</h2>
          <InfoRows rows={[
            ['Ruangan dipilih', item.room?.name],
            ['Gedung / Lokasi', item.room?.building],
            ['Lantai', item.room?.floor],
            ['Kapasitas', `${item.room?.capacity ?? '-'} orang`],
            ['Kondisi', item.room?.condition || 'Baik'],
          ]} />
        </Card>
        <Card>
          <h2>Logistik yang diminta</h2>
          {(item.logistics || []).length ? (
            <div className="logistik-requested-items">
              {item.logistics.map((line) => (
                <div key={line.id || line.label}>
                  <span><strong>{line.label}</strong><small>Diminta {line.quantity} {line.unit}</small></span>
                  <StatusBadge status={`Stok total ${line.stock} ${line.unit}`} />
                </div>
              ))}
            </div>
          ) : (
            <p>Tidak ada barang tambahan pada permintaan ini.</p>
          )}
        </Card>
      </div>

      {waitingPembina && (
        <div className="logistik-notice">
          <ShieldCheck size={18} />
          <span>Pengajuan ini masih menunggu persetujuan Pembina. Logistik belum dapat memberikan keputusan.</span>
        </div>
      )}

      {awaitingLogistics && issues.length > 0 && (
        <Card>
          <h2>Peringatan Ketersediaan</h2>
          {issues.map((issue, idx) => (
            <p className="logistik-error" key={idx}>
              {issue.type === 'ROOM_CONFLICT'
                ? `Ruangan bentrok: ${issue.nama_ruangan || '-'}`
                : `Stok kurang: ${issue.nama_logistik || '-'} (diminta ${issue.diminta}, tersedia ${issue.tersedia})`}
            </p>
          ))}
        </Card>
      )}

      {actionFeedback && <p className="form-feedback" role="status">{actionFeedback}</p>}

      {awaitingLogistics && (
        <div className="logistik-detail-actions">
          <Button disabled={!isAvailable} onClick={() => { setDecision('approve'); setNote(''); setError('') }}><CheckCircle2 size={16} />Terima</Button>
          <Button onClick={() => { setDecision('revision'); setNote(''); setError('') }} variant="secondary">Minta Perbaikan</Button>
          <Button onClick={() => { setDecision('reject'); setNote(''); setError('') }} variant="destructive"><XCircle size={16} />Tolak</Button>
        </div>
      )}

      {item.status_code === 'APPROVED_LOGISTIK' && !item.sbpPublished && (
        <Button onClick={() => setPublishOpen(true)}><FileText size={16} />Terbitkan SBP (PDF)</Button>
      )}

      {item.sbpPublished && (
        <Button onClick={() => navigate(`/logistik/dokumen/${item.id}`, { state: { from: location.state?.from || '/logistik/pengajuan' } })} variant="secondary">
          <FileText size={16} />Lihat SBP
        </Button>
      )}

      <Modal onClose={() => !submitting && setDecision('')} open={Boolean(decision)} title={decision === 'approve' ? 'Terima pengajuan?' : decision === 'reject' ? 'Tolak pengajuan?' : 'Minta perbaikan?'}>
        <p className="modal-copy">
          {decision === 'approve'
            ? 'Ketersediaan ruangan dan stok akan dikunci dalam transaksi untuk pengajuan ini.'
            : 'Keputusan dan catatan akan dikirim ke Peminjam melalui notifikasi dan email.'}
        </p>
        <label className="form-field">
          <span className="form-field__label">{decision === 'approve' ? 'Catatan pemeriksaan (opsional)' : 'Catatan pemeriksaan (wajib)'}</span>
          <textarea className="form-control logistik-textarea" maxLength="1000" onChange={(event) => { setNote(event.target.value); setError('') }} value={note} />
          {error && <small className="form-field__message form-field__message--error">{error}</small>}
        </label>
        <div className="modal-actions">
          <Button disabled={submitting} onClick={() => setDecision('')} variant="secondary">Batal</Button>
          <Button disabled={submitting} onClick={commitDecision}>{submitting ? 'Menyimpan…' : decision === 'approve' ? 'Terima' : decision === 'reject' ? 'Tolak' : 'Kirim catatan'}</Button>
        </div>
      </Modal>

      <Modal onClose={() => !submitting && setPublishOpen(false)} open={publishOpen} title="Terbitkan SBP resmi?">
        <p className="modal-copy">Sistem akan menghasilkan file PDF Surat Bukti Peminjaman dan mengubah status pengajuan menjadi Dipinjam.</p>
        <div className="modal-actions">
          <Button disabled={submitting} onClick={() => setPublishOpen(false)} variant="secondary">Batal</Button>
          <Button disabled={submitting} onClick={publishDocument}>{submitting ? 'Menerbitkan…' : 'Terbitkan SBP'}</Button>
        </div>
      </Modal>
    </div>
  )
}

function DocumentList({ ctx, detail = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [downloadError, setDownloadError] = useState('')
  const sbpRecords = ctx.requests.filter((item) => item.sbpPublished || item.sbp)
  const sbpgRecords = ctx.requests.filter((item) => Boolean(item.sbpg || item.returned))

  const handleDownloadSbp = async (item) => {
    setDownloadError('')
    try {
      await ctx.downloadSbp(item.id, item.sbp?.nomor_sbp)
    } catch (error) {
      setDownloadError(error.message)
    }
  }

  if (detail) {
    const item = sbpRecords.find((value) => String(value.id) === String(id))
    if (!item) {
      return <div className="logistik-page"><BackLink to="/logistik/dokumen" /><Card><h2>Dokumen belum tersedia</h2><p>SBP hanya tersedia setelah persetujuan Pembina & Logistik serta penerbitan SBP.</p></Card></div>
    }
    return (
      <div className="logistik-page">
        <BackLink to={location.state?.from || '/logistik/dokumen'} />
        <PageTitle eyebrow="DOKUMEN RESMI" title={item.sbp?.nomor_sbp || `SBP · ${item.id}`} />
        <Card className="logistik-document-preview">
          <h2>SURAT BUKTI PEMINJAMAN</h2>
          <p>NOOBO · Administrasi Peminjaman Kampus</p>
          <InfoRows rows={[
            ['Nomor SBP', item.sbp?.nomor_sbp || `SBP-${item.id}`],
            ['Nomor Pengajuan', item.nomor_pengajuan || item.id],
            ['Peminjam', item.borrower?.name],
            ['Kegiatan', item.event?.name],
            ['Jadwal', `${item.event?.date} · ${formatTimeRange(item.event?.startTime, item.event?.endTime)} WIB`],
            ['Ruangan', item.room ? `${item.room.name} · ${item.room.building}` : '-'],
            ['Logistik', (item.logistics || []).map((line) => `${line.label} ${line.quantity} ${line.unit}`).join(', ') || 'Tidak ada'],
            ['Persetujuan', `${item.supervisorStatus}; ${item.logisticsStatus}`],
          ]} />
        </Card>
        {downloadError && <p className="logistik-error" role="alert">{downloadError}</p>}
        <div className="logistik-detail-actions">
          <Button onClick={() => window.print()}><Printer size={16} />Cetak</Button>
          <Button onClick={() => handleDownloadSbp(item)} variant="secondary"><Download size={16} />Unduh PDF</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="logistik-page">
      <BackLink to="/logistik" label="Beranda" />
      <PageTitle eyebrow="ARSIP DOKUMEN" title="Dokumen Peminjaman & Pengembalian" description="Daftar dokumen SBP dan laporan pengembalian SBPG." />
      <section className="logistik-section">
        <div className="logistik-section__title"><h2>SBP · Surat Bukti Peminjaman</h2></div>
        <div className="logistik-list">
          {sbpRecords.length ? sbpRecords.map((item) => (
            <div className="logistik-list-row" key={`sbp-${item.id}`}>
              <span className="logistik-row-icon"><FileText size={18} /></span>
              <span>
                <strong>{item.event?.name}</strong>
                <small>{item.sbp?.nomor_sbp || `SBP-${item.id}`} · {item.room?.name} · {item.event?.date}</small>
                <StatusBadge status="SBP tersedia" />
              </span>
              <Button onClick={() => navigate(`/logistik/dokumen/${item.id}`, { state: { from: '/logistik/dokumen' } })} variant="secondary">Lihat</Button>
            </div>
          )) : (
            <Card className="logistik-empty">Belum ada SBP yang diterbitkan.</Card>
          )}
        </div>
      </section>
      <section className="logistik-section">
        <div className="logistik-section__title"><h2>SBPG · Surat Bukti Pengembalian</h2></div>
        <div className="logistik-list">
          {sbpgRecords.length ? sbpgRecords.map((item) => (
            <div className="logistik-list-row" key={`sbpg-${item.id}`}>
              <span className="logistik-row-icon"><PackageCheck size={18} /></span>
              <span>
                <strong>{item.event?.name}</strong>
                <small>SBPG-{item.nomor_pengajuan || item.id} · {item.borrower?.name}</small>
                <StatusBadge status={item.status_code === 'COMPLETED' ? 'Selesai diperiksa' : 'Menunggu pemeriksaan'} />
              </span>
              <Button onClick={() => navigate(`/logistik/dokumen/sbpg/${item.id}`, { state: { from: '/logistik/dokumen' } })} variant="secondary">Lihat</Button>
            </div>
          )) : (
            <Card className="logistik-empty">Belum ada SBPG yang dikirim Peminjam.</Card>
          )}
        </div>
      </section>
    </div>
  )
}

function ReturnDocument({ ctx }) {
  const { id } = useParams()
  const location = useLocation()
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    apiGetLogisticsRequestDetail(id).then(setDetail).catch(() => {})
  }, [id])

  const item = detail || ctx.requests.find((entry) => String(entry.id) === String(id))
  if (!item || !item.sbpg) {
    return <div className="logistik-page"><BackLink to="/logistik/dokumen" /><Card><h2>SBPG belum tersedia</h2><p>Laporan pengembalian belum dikirim oleh Peminjam.</p></Card></div>
  }

  const details = item.return_details || []
  const summaryLines = details.map((d) => `Jumlah kembali: ${d.jumlah_dikembalikan}, kondisi: ${d.kondisi_kembali}${d.catatan ? ` (${d.catatan})` : ''}`).join('; ')
  const documentText = [
    `SBPG · ${item.nomor_pengajuan || item.id}`,
    `SBP terkait: ${item.sbp?.nomor_sbp || '-'}`,
    `Kegiatan: ${item.event?.name}`,
    `Peminjam: ${item.borrower?.name}`,
    `Ketepatan waktu: ${item.sbpg.status_ketepatan_waktu}`,
    `Detail kembali: ${summaryLines || '-'}`,
    `Catatan peminjam: ${item.sbpg.catatan_peminjam || 'Tidak ada'}`,
    `Status: ${item.status}`,
  ].join('\n')

  return (
    <div className="logistik-page">
      <BackLink to={location.state?.from || `/logistik/pemeriksaan/${id}`} />
      <PageTitle eyebrow="DOKUMEN PENGEMBALIAN" title={`SBPG · ${item.nomor_pengajuan || item.id}`} />
      <Card className="logistik-document-preview">
        <h2>SURAT BUKTI PENGEMBALIAN</h2>
        <p>NOOBO · Administrasi Peminjaman Kampus</p>
        <InfoRows rows={[
          ['Nomor Pengajuan', item.nomor_pengajuan || item.id],
          ['SBP terkait', item.sbp?.nomor_sbp || '-'],
          ['Peminjam', item.borrower?.name],
          ['Kegiatan', item.event?.name],
          ['Jadwal kegiatan', `${item.event?.date} · ${formatTimeRange(item.event?.startTime, item.event?.endTime)} WIB`],
          ['Waktu kirim SBPG', item.sbpg.waktu_kirim ? new Date(item.sbpg.waktu_kirim).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) + ' WIB' : '-'],
          ['Ketepatan waktu', item.sbpg.status_ketepatan_waktu === 'TERLAMBAT' ? 'Terlambat' : 'Tepat waktu'],
          ['Status pemeriksaan', item.status],
          ['Detail pengembalian', summaryLines || '-'],
          ['Catatan Peminjam', item.sbpg.catatan_peminjam || 'Tidak ada'],
        ]} />
      </Card>
      <div className="logistik-detail-actions">
        <Button onClick={() => window.print()}><Printer size={16} />Cetak</Button>
        <Button onClick={() => downloadText(`SBPG-${item.nomor_pengajuan || item.id}.txt`, documentText)} variant="secondary"><Download size={16} />Unduh</Button>
      </div>
    </div>
  )
}

function ReturnList({ ctx, detail = false }) {
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const [detailRecord, setDetailRecord] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [findingType, setFindingType] = useState('')
  const [findingQty, setFindingQty] = useState('1')
  const [findingDesc, setFindingDesc] = useState('')
  const [feedback, setFeedback] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState('Semua')
  const [query, setQuery] = useState('')

  const loadDetail = async () => {
    if (!detail || !id) return
    setLoading(true)
    try {
      setDetailRecord(await apiGetLogisticsRequestDetail(id))
    } catch {
      setDetailRecord(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!detail || !id) return
    let active = true
    apiGetLogisticsRequestDetail(id)
      .then((data) => {
        if (active) setDetailRecord(data)
      })
      .catch(() => {
        if (active) setDetailRecord(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [detail, id])

  const records = ctx.requests.filter((item) => item.status_code === 'ONGOING' || item.status_code === 'RETURN_REPORTED' || item.status_code === 'COMPLETED')
  const item = (detailRecord && String(detailRecord.id) === String(id) ? detailRecord : null) || records.find((value) => String(value.id) === String(id))

  const inspect = async () => {
    if (!item || submitting) return
    setSubmitting(true)
    setFeedback('')
    try {
      const temuan = findingType && findingDesc.trim()
        ? [{
            jenis_temuan: findingType,
            jumlah: Math.max(1, Number(findingQty) || 1),
            deskripsi: findingDesc.trim(),
          }]
        : []
      await ctx.submitInspection(item.id, {
        catatan: message.trim() || undefined,
        ...(temuan.length ? { temuan } : {}),
      })
      setConfirmOpen(false)
      setFeedback('Pemeriksaan pengembalian selesai dan alokasi telah dilepas.')
      await loadDetail()
    } catch (error) {
      setConfirmOpen(false)
      setFeedback(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (detail) {
    if (loading && !item) return <div className="logistik-page"><BackLink to="/logistik/pengembalian" /><Card><p>Memuat data pemeriksaan…</p></Card></div>
    if (!item) return <div className="logistik-page"><BackLink to="/logistik/pengembalian" /><Card><h2>Transaksi tidak ditemukan</h2></Card></div>
    const hasReport = Boolean(item.sbpg)
    const isCompleted = item.status_code === 'COMPLETED'
    const returnDetails = item.return_details || []

    return (
      <div className="logistik-page">
        <BackLink to={location.state?.from || '/logistik/pengembalian'} />
        <PageTitle eyebrow="PEMERIKSAAN PENGEMBALIAN" title={item.event?.name} description={`Transaksi ${item.nomor_pengajuan || item.id}`} />
        <Card>
          <h2>Jadwal &amp; status pengembalian</h2>
          <InfoRows rows={[
            ['Peminjam', item.borrower?.name],
            ['Kegiatan selesai', `${requestDate(item)} ${item.event?.endTime || ''} WIB`],
            ['Status', item.status],
            ['Waktu kirim SBPG', item.sbpg?.waktu_kirim ? new Date(item.sbpg.waktu_kirim).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' }) + ' WIB' : 'Belum dikirim'],
            ['Ketepatan waktu', item.sbpg?.status_ketepatan_waktu === 'TERLAMBAT' ? 'Terlambat' : item.sbpg?.status_ketepatan_waktu === 'TEPAT_WAKTU' ? 'Tepat waktu' : '-'],
          ]} />
        </Card>

        {!hasReport ? (
          <div className="logistik-notice">
            <PackageCheck size={18} />
            <span>Peminjam belum mengirim laporan SBPG. Pemeriksaan dapat dilakukan setelah SBPG diterima.</span>
          </div>
        ) : (
          <>
            <Card>
              <h2>Detail laporan SBPG</h2>
              {returnDetails.length ? (
                <div className="logistik-return-lines">
                  {returnDetails.map((line, index) => (
                    <div className="logistik-return-line" key={line.id_detail_pengembalian || index}>
                      <strong>{line.id_alokasi_ruangan ? 'Ruangan' : `Item Alokasi #${line.id_alokasi_logistik}`}</strong>
                      <small>Dilaporkan kembali: {line.jumlah_dikembalikan} · Kondisi: {line.kondisi_kembali}</small>
                      {line.catatan && <small>Catatan: {line.catatan}</small>}
                    </div>
                  ))}
                </div>
              ) : (
                <p>Laporan pengembalian telah diterima.</p>
              )}
              <InfoRows rows={[['Catatan peminjam', item.sbpg?.catatan_peminjam || 'Tidak ada catatan']]} />
            </Card>
            <Button onClick={() => navigate(`/logistik/dokumen/sbpg/${item.id}`, { state: { from: location.pathname } })} variant="secondary">
              <FileText size={16} />Lihat SBPG
            </Button>
            {!isCompleted && (
              <>
                <Card>
                  <h2>Catat hasil pemeriksaan</h2>
                  <label className="form-field">
                    <span className="form-field__label">Catatan pemeriksaan Logistik</span>
                    <textarea className="form-control logistik-textarea" maxLength="1000" onChange={(event) => { setMessage(event.target.value); setFeedback('') }} value={message} />
                  </label>
                  <label className="form-field">
                    <span className="form-field__label">Temuan kerusakan/kehilangan (opsional)</span>
                    <select className="form-control" onChange={(e) => setFindingType(e.target.value)} value={findingType}>
                      <option value="">Tidak ada temuan</option>
                      <option value="DAMAGED">Rusak (DAMAGED)</option>
                      <option value="LOST">Hilang (LOST)</option>
                      <option value="INCOMPLETE">Tidak Lengkap (INCOMPLETE)</option>
                    </select>
                  </label>
                  {findingType && (
                    <>
                      <Input label="Jumlah item temuan" min="1" onChange={(e) => setFindingQty(e.target.value)} type="number" value={findingQty} />
                      <label className="form-field">
                        <span className="form-field__label">Deskripsi temuan</span>
                        <textarea className="form-control logistik-textarea" maxLength="1000" onChange={(e) => setFindingDesc(e.target.value)} value={findingDesc} />
                      </label>
                    </>
                  )}
                </Card>
                <Button disabled={submitting} onClick={() => setConfirmOpen(true)}>
                  <CheckCircle2 size={16} />{submitting ? 'Menyimpan…' : 'Selesaikan Pemeriksaan'}
                </Button>
              </>
            )}
            {feedback && <p className="form-feedback" role="status">{feedback}</p>}
            <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Konfirmasi pemeriksaan">
              <p className="modal-copy">Alokasi ruangan dan logistik akan dilepas dan transaksi ditandai Selesai.</p>
              <div className="modal-actions">
                <Button disabled={submitting} onClick={() => setConfirmOpen(false)} variant="secondary">Kembali</Button>
                <Button disabled={submitting} onClick={inspect}>{submitting ? 'Menyimpan…' : 'Konfirmasi'}</Button>
              </div>
            </Modal>
          </>
        )}
      </div>
    )
  }

  const shown = records.filter((value) => (
    `${value.id} ${value.nomor_pengajuan || ''} ${value.event?.name || ''} ${value.borrower?.name || ''}`.toLowerCase().includes(query.toLowerCase())
    && (filter === 'Semua'
      || (filter === 'Menunggu laporan'
        ? value.status_code === 'ONGOING'
        : filter === 'Menunggu pemeriksaan'
          ? value.status_code === 'RETURN_REPORTED'
          : value.status_code === 'COMPLETED'))
  ))

  return (
    <div className="logistik-page">
      <BackLink to="/logistik" label="Beranda" />
      <PageTitle eyebrow="FASILITAS KEMBALI" title="Pemeriksaan & Pengembalian" description="Tinjau laporan SBPG dan catat hasil pemeriksaan fasilitas." />
      <label className="workspace-search">
        <Search size={17} />
        <input aria-label="Cari transaksi pengembalian" onChange={(event) => setQuery(event.target.value)} placeholder="Cari nomor, kegiatan, atau peminjam" value={query} />
      </label>
      <div className="logistik-status-filter">
        <Select className="logistik-select-control" label="Filter status" onChange={(event) => setFilter(event.target.value)} value={filter}>
          {['Semua', 'Menunggu laporan', 'Menunggu pemeriksaan', 'Selesai'].map((value) => <option key={value}>{value}</option>)}
        </Select>
      </div>
      <div className="logistik-list">
        {shown.map((value) => (
          <button className="logistik-request-card" key={value.id} onClick={() => navigate(`/logistik/pengembalian/${value.id}`, { state: { from: '/logistik/pengembalian' } })} type="button">
            <span className="logistik-row-icon"><PackageCheck size={18} /></span>
            <span className="logistik-request-card__body">
              <strong>{value.event?.name}</strong>
              <small>{value.nomor_pengajuan || value.id} · {value.event?.date} · {value.borrower?.name}</small>
              <StatusBadge status={value.status_code === 'COMPLETED' ? 'Selesai' : value.status_code === 'RETURN_REPORTED' ? 'Menunggu Pemeriksaan Logistik' : 'Menunggu laporan Peminjam'} />
            </span>
            <ChevronRight size={18} />
          </button>
        ))}
      </div>
      {!shown.length && <Card className="logistik-empty">Tidak ada transaksi pada filter ini.</Card>}
    </div>
  )
}

function LogisticsAboutPage() {
  const features = [
    [ClipboardList, 'Form Spesifikasi Kebutuhan (FSK)', 'Mencatat kebutuhan kegiatan, jadwal, dan fasilitas.'],
    [Sparkles, 'Rekomendasi Paket', 'Membantu memilih paket ruangan dan logistik yang sesuai.'],
    [FileCheck2, 'Form Pengajuan Peminjaman (FPP)', 'Menyusun informasi pengajuan untuk ditinjau.'],
    [ShieldCheck, 'Persetujuan', 'Melibatkan Pembina dan Logistik Kampus.'],
    [CalendarCheck, 'SBP', 'Dokumen bukti peminjaman setelah persetujuan.'],
    [PackageCheck, 'SBPG', 'Laporan fasilitas dan proses pengembalian.'],
  ]
  const developers = ['Aria Restu Pambudi', 'Bagas Dwi Andra', 'Brian Alfredo Adhita Putra', 'Tungkot Isahito Eleazar', 'M Gibran Khalilullah']
  return (
    <div className="workflow-page about-page">
      <BackLink to="/logistik/profil" />
      <header className="workflow-heading"><p className="eyebrow">INFORMASI APLIKASI</p><h1>Tentang NOOBO</h1></header>
      <AboutBrand />
      <section className="about-editorial"><p className="about-lead">Sistem peminjaman ruangan dan fasilitas logistik kampus berbasis web dengan rekomendasi paket.</p><p>NOOBO membantu peminjam menyampaikan kebutuhan kegiatan, memilih ruangan dan logistik, mengajukan peminjaman, serta mengikuti proses persetujuan dan pengelolaan dokumen peminjaman maupun pengembalian.</p></section>
      <section className="about-section"><h2>Fitur utama</h2><div className="about-feature-list">{features.map(([Icon, title, description]) => <div className="about-feature" key={title}><Icon size={19} /><div><h3>{title}</h3><p>{description}</p></div></div>)}</div></section>
      <section className="about-section"><h2>Pengembang</h2><ol className="developer-list">{developers.map((name, index) => <li key={name}><span>{String(index + 1).padStart(2, '0')}</span>{name}</li>)}</ol></section>
    </div>
  )
}

function ProfilePage({ ctx, section }) {
  const [logoutOpen, setLogoutOpen] = useState(false)
  const p = ctx.profile
  if (section === 'info') {
    return (
      <div className="workflow-page">
        <BackLink to="/logistik/profil" />
        <header className="workflow-heading"><p className="eyebrow">AKUN LOGISTIK</p><h1>Informasi Petugas</h1></header>
        <Card className="profile-card">
          <div aria-hidden="true" className="dashboard-avatar">{p.initials}</div>
          <div className="profile-identity"><h2>{p.name}</h2><p>{p.roleLabel}</p></div>
          <dl className="confirmation-details profile-readonly">
            <div><dt>Email Akun</dt><dd>{p.email}</dd></div>
            <div><dt>Bagian/Unit Kerja</dt><dd>{p.unit}</dd></div>
          </dl>
        </Card>
      </div>
    )
  }
  if (section === 'help') {
    return (
      <div className="logistik-page">
        <BackLink to="/logistik/profil" />
        <PageTitle eyebrow="DUKUNGAN" title="Bantuan & Kontak" description="Panduan singkat untuk pekerjaan Logistik Kampus." />
        <div className="help-faq">
          <details><summary>Bagaimana memproses pengajuan?<ChevronRight size={17} /></summary><p>Proses pengajuan setelah Pembina menyetujuinya. Periksa jadwal, kapasitas ruangan, ketersediaan, dan stok sebelum memberi keputusan.</p></details>
          <details><summary>Kapan dokumen SBP tersedia?<ChevronRight size={17} /></summary><p>SBP resmi (PDF) dapat diterbitkan setelah pengajuan disetujui Pembina dan Logistik.</p></details>
          <details><summary>Bagaimana memeriksa pengembalian?<ChevronRight size={17} /></summary><p>Buka transaksi yang memiliki laporan SBPG, periksa kondisi barang, catat temuan bila ada, lalu selesaikan pemeriksaan.</p></details>
        </div>
      </div>
    )
  }
  if (section === 'about') return <LogisticsAboutPage />
  return (
    <div className="workflow-page logistik-profile-page">
      <header className="workflow-heading"><p className="eyebrow">AKUN LOGISTIK</p><h1>Profil Saya</h1></header>
      <Card className="profile-card">
        <div aria-hidden="true" className="dashboard-avatar">{p.initials}</div>
        <div className="profile-identity"><h2>{p.name}</h2><p>{p.roleLabel}</p></div>
        <dl className="confirmation-details profile-readonly">
          <div><dt>Email Akun</dt><dd>{p.email}</dd></div>
          <div><dt>Bagian/Unit Kerja</dt><dd>{p.unit}</dd></div>
        </dl>
      </Card>
      <section className="profile-menu">
        <h2>Pengaturan &amp; informasi</h2>
        <Link className="profile-menu-card" to="/logistik/profil/informasi"><UserRound size={19} /><span><strong>Informasi Petugas</strong><small>Lihat informasi akun.</small></span><ChevronRight size={18} aria-hidden="true" /></Link>
        <Link className="profile-menu-card" to="/logistik/profil/bantuan"><CircleHelp size={19} /><span><strong>Bantuan &amp; Kontak</strong><small>Panduan penggunaan layanan.</small></span><ChevronRight size={18} aria-hidden="true" /></Link>
        <Link className="profile-menu-card" to="/logistik/profil/tentang"><Info size={19} /><span><strong>Tentang NOOBO</strong><small>Informasi aplikasi dan fitur.</small></span><ChevronRight size={18} aria-hidden="true" /></Link>
      </section>
      <Button className="profile-logout" onClick={() => setLogoutOpen(true)} variant="tertiary"><LogOut size={16} />Keluar</Button>
      <Modal onClose={() => setLogoutOpen(false)} open={logoutOpen} title="Keluar dari akun?">
        <p className="modal-copy">Sesi Logistik Anda akan diakhiri.</p>
        <div className="modal-actions"><Button onClick={() => setLogoutOpen(false)} variant="secondary">Batal</Button><Button onClick={ctx.logout}>Keluar</Button></div>
      </Modal>
    </div>
  )
}

export default function LogistikWorkspacePage({ section }) {
  const outlet = useOutletContext()
  const routeSection = section || 'dashboard'
  const ctx = { ...outlet, requests: outlet.applications || [] }
  if (routeSection === 'dashboard') return <Dashboard ctx={ctx} />
  if (routeSection === 'data') return <DataHome />
  if (routeSection === 'rooms') return <ResourceList ctx={ctx} kind="room" />
  if (routeSection === 'inventory') return <ResourceList ctx={ctx} kind="inventory" />
  if (routeSection === 'room-detail') return <ResourceDetail ctx={ctx} kind="room" />
  if (routeSection === 'inventory-detail') return <ResourceDetail ctx={ctx} kind="inventory" />
  if (routeSection === 'applications') return <RequestList ctx={ctx} />
  if (routeSection === 'application-detail') return <RequestDetail ctx={ctx} />
  if (routeSection === 'documents') return <DocumentList ctx={ctx} />
  if (routeSection === 'document-detail') return <DocumentList ctx={ctx} detail />
  if (routeSection === 'return-document') return <ReturnDocument ctx={ctx} />
  if (routeSection === 'returns') return <ReturnList ctx={ctx} />
  if (routeSection === 'return-detail') return <ReturnList ctx={ctx} detail />
  return <ProfilePage ctx={ctx} section={routeSection.replace('profile-', '') === 'profile' ? 'profile' : routeSection.replace('profile-', '')} />
}
