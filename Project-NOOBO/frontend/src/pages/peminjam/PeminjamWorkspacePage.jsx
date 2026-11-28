import { useEffect, useState } from 'react'
import { ArrowLeft, Bell, CalendarDays, CheckCheck, ClipboardList, Download, PackageCheck, Printer, Search, XCircle } from 'lucide-react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { formatTimeRange } from '../../utils/time-format.js'
import { apiDownloadSbpPdf, apiGetMyLoanRequest, apiGetReturnForm, apiListHistory } from '../../api/client.js'

const titleMap = { pengajuan: 'Peminjaman Saya', riwayat: 'Riwayat Peminjaman', profil: 'Profil Peminjam', notifikasi: 'Notifikasi' }
const CANCELLABLE_CODES = new Set(['SUBMITTED', 'WAITING_PEMBINA', 'WAITING_LOGISTIK', 'REVISION_LOGISTIK'])

function Back({ to = '/peminjam/pengajuan', children = 'Kembali' }) {
  return <Link className="workflow-back-link" to={to}><ArrowLeft size={17} aria-hidden="true" />{children}</Link>
}

function InfoList({ rows }) {
  return <dl className="confirmation-details">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '-'}</dd></div>)}</dl>
}

function TransactionFilters({ status, setStatus, start, setStart, end, setEnd, onApply, onReset }) {
  return (
    <section className="transaction-filters" aria-label="Filter transaksi">
      <label className="filter-field">
        <span>Filter status</span>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          {['Semua', 'Menunggu Pembina', 'Menunggu Logistik', 'Disetujui', 'Ditolak', 'Selesai'].map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      <fieldset className="filter-range">
        <legend>Rentang tanggal</legend>
        <label className="filter-field"><span>Tanggal mulai</span><span className="filter-date"><CalendarDays size={16} /><input aria-label="Tanggal mulai filter" type="date" value={start} onChange={(event) => setStart(event.target.value)} /></span></label>
        <label className="filter-field"><span>Tanggal selesai</span><span className="filter-date"><CalendarDays size={16} /><input aria-label="Tanggal selesai filter" type="date" value={end} onChange={(event) => setEnd(event.target.value)} /></span></label>
      </fieldset>
      <div className="filter-actions"><Button onClick={onApply}>Terapkan</Button><Button onClick={onReset} variant="secondary">Reset Filter</Button></div>
    </section>
  )
}

function SbpgForm({ record, submitReturnReport, onSubmitted }) {
  const [formItems, setFormItems] = useState([])
  const alreadySubmitted = Boolean(record.sbpg || record.returned || record.status_code === 'RETURN_REPORTED' || record.status_code === 'COMPLETED')
  const [loading, setLoading] = useState(() => !alreadySubmitted && record.status_code === 'ONGOING')
  const [loadError, setLoadError] = useState('')
  const [notes, setNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (alreadySubmitted || record.status_code !== 'ONGOING') return
    let active = true
    apiGetReturnForm(record.id)
      .then((data) => {
        if (!active) return
        const lines = [
          ...(data.logistik || []).map((item) => ({
            key: `log-${item.id_alokasi_logistik}`,
            id_alokasi_logistik: item.id_alokasi_logistik,
            label: item.nama_logistik,
            quantity: Number(item.jumlah_dipinjam || 1),
            unit: item.satuan || 'unit',
            returnedQuantity: String(item.jumlah_dipinjam ?? 1),
            condition: 'Baik',
          })),
          ...(data.ruangan || []).map((room) => ({
            key: `room-${room.id_alokasi_ruangan}`,
            id_alokasi_ruangan: room.id_alokasi_ruangan,
            label: `Ruangan: ${room.nama_ruangan}`,
            quantity: 1,
            unit: 'ruang',
            returnedQuantity: '1',
            condition: 'Baik',
          })),
        ]
        setFormItems(lines)
        setLoadError('')
      })
      .catch((error) => {
        if (active) setLoadError(error.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [record.id, record.status_code, alreadySubmitted])

  if (alreadySubmitted) {
    const sbpg = record.sbpg
    const details = record.return_details || []
    return (
      <Card>
        <Badge tone={record.status_code === 'COMPLETED' ? 'success' : 'info'}>
          {record.status_code === 'COMPLETED' ? 'Selesai diperiksa Logistik' : 'Menunggu Pemeriksaan Logistik'}
        </Badge>
        <p>{record.status_code === 'COMPLETED' ? 'Pengembalian telah diperiksa dan dinyatakan selesai oleh Logistik Kampus.' : 'Laporan pengembalian (SBPG) telah dikirim dan menunggu pemeriksaan Logistik Kampus.'}</p>
        <InfoList rows={[
          ['Waktu kirim', sbpg?.waktu_kirim ? new Date(sbpg.waktu_kirim).toLocaleString('id-ID', { hourCycle: 'h23', timeZone: 'Asia/Jakarta' }) : '-'],
          ['Ketepatan waktu', sbpg?.status_ketepatan_waktu === 'TERLAMBAT' ? 'Terlambat' : sbpg?.status_ketepatan_waktu === 'TEPAT_WAKTU' ? 'Tepat waktu' : '-'],
          ['Catatan peminjam', sbpg?.catatan_peminjam || 'Tidak ada catatan'],
          ['Item dilaporkan', details.length ? details.map((d) => `${d.nama_ruangan ? `Ruangan ${d.nama_ruangan}` : d.nama_logistik || 'Item'}: ${d.jumlah_dikembalikan} (${d.kondisi_kembali})`).join(', ') : '-'],
        ]} />
      </Card>
    )
  }

  if (loading) return <Card><p>Memuat daftar barang pengembalian…</p></Card>
  if (loadError) return <Card><p className="logistik-error">{loadError}</p></Card>

  const deadline = record.event?.endDate || record.event?.date
    ? Date.parse(`${record.event.endDate || record.event.date}T${record.event.endTime || '00:00'}:00+07:00`) + 60 * 60 * 1000
    : null
  const complete = formItems.length > 0 && formItems.every(
    (item) => item.returnedQuantity !== '' && Number(item.returnedQuantity) >= 0 && Number(item.returnedQuantity) <= Number(item.quantity) && item.condition && (item.condition === 'Baik' || notes.trim()),
  )

  const submit = async () => {
    if (submitting) return
    setSubmitError('')
    setSubmitting(true)
    try {
      await submitReturnReport(record.id, {
        catatan: notes.trim() || undefined,
        items: formItems.map((item) => ({
          ...(item.id_alokasi_ruangan ? { id_alokasi_ruangan: item.id_alokasi_ruangan } : {}),
          ...(item.id_alokasi_logistik ? { id_alokasi_logistik: item.id_alokasi_logistik } : {}),
          jumlah_dikembalikan: Number(item.returnedQuantity),
          kondisi_kembali: item.condition,
          catatan: notes.trim() || undefined,
        })),
      })
      setConfirmOpen(false)
      if (onSubmitted) await onSubmitted()
    } catch (error) {
      setConfirmOpen(false)
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card className="sbpg-form">
        <h2>Checklist pengembalian</h2>
        {deadline && <p>{record.event?.name} · batas kirim: {new Date(deadline).toLocaleString('id-ID', { hourCycle: 'h23', timeZone: 'Asia/Jakarta' })} WIB</p>}
        {formItems.map((item, index) => (
          <div className="sbpg-item" key={item.key}>
            <strong>{item.label} · dipinjam {item.quantity} {item.unit}</strong>
            <label className="form-field">
              <span className="form-field__label">Jumlah dikembalikan</span>
              <input className="form-control" min="0" max={item.quantity} type="number" value={item.returnedQuantity} onChange={(event) => setFormItems((current) => current.map((value, i) => (i === index ? { ...value, returnedQuantity: event.target.value } : value)))} />
            </label>
            <label className="form-field">
              <span className="form-field__label">Kondisi barang</span>
              <select className="form-control" value={item.condition} onChange={(event) => setFormItems((current) => current.map((value, i) => (i === index ? { ...value, condition: event.target.value } : value)))}>
                <option value="">Pilih kondisi</option>
                <option>Baik</option>
                <option>Rusak</option>
                <option>Hilang</option>
              </select>
            </label>
          </div>
        ))}
        <label className="form-field">
          <span className="form-field__label">Catatan kerusakan atau kehilangan</span>
          <textarea className="form-control workflow-textarea" maxLength="500" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Wajib diisi jika ada barang rusak atau hilang" />
        </label>
      </Card>
      {submitError && <p className="logistik-error" role="alert">{submitError}</p>}
      <Button disabled={!complete || submitting} onClick={() => setConfirmOpen(true)}>
        <PackageCheck size={16} />{submitting ? 'Mengirim…' : 'Konfirmasi pengiriman SBPG'}
      </Button>
      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Kirim laporan pengembalian?">
        <p className="modal-copy">Laporan pengembalian akan dicatat dan diteruskan untuk pemeriksaan fisik oleh Logistik Kampus.</p>
        <div className="modal-actions">
          <Button disabled={submitting} variant="secondary" onClick={() => setConfirmOpen(false)}>Periksa lagi</Button>
          <Button disabled={submitting} onClick={submit}>{submitting ? 'Mengirim…' : 'Kirim SBPG'}</Button>
        </div>
      </Modal>
    </>
  )
}

export default function PeminjamWorkspacePage({ section }) {
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const outlet = useOutletContext()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [draftFilter, setDraftFilter] = useState('Semua')
  const [draftStart, setDraftStart] = useState('')
  const [draftEnd, setDraftEnd] = useState('')
  const [detailRecord, setDetailRecord] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [historyRecords, setHistoryRecords] = useState(null)
  const [actionError, setActionError] = useState('')
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelNote, setCancelNote] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const {
    submittedApplications = [],
    notifications = [],
    markNotificationRead,
    markAllNotificationsRead,
    notificationPreferences,
    cancelApplication,
    submitReturnReport,
  } = outlet

  const needsDetail = (section === 'detail' || section === 'dokumen') && Boolean(params.id)
  const loadDetail = async (id) => {
    setDetailLoading(true)
    setActionError('')
    try {
      const data = await apiGetMyLoanRequest(id)
      setDetailRecord(data)
    } catch {
      setDetailRecord(null)
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    if (!needsDetail) return
    let active = true
    apiGetMyLoanRequest(params.id)
      .then((data) => {
        if (active) setDetailRecord(data)
      })
      .catch(() => {
        if (active) setDetailRecord(null)
      })
      .finally(() => {
        if (active) setDetailLoading(false)
      })
    return () => { active = false }
  }, [needsDetail, params.id])

  const record = (detailRecord && String(detailRecord.id) === String(params.id) ? detailRecord : null)
    || submittedApplications.find((x) => String(x.id) === String(params.id))

  const preferenceForCategory = { Pengajuan: 'applicationStatus', Persetujuan: 'applicationStatus', Dokumen: 'documents', Kegiatan: 'eventReminders', Pengembalian: 'returnReminders', 'Informasi Kampus': 'campusInformation' }
  const visibleNotifications = notifications.filter((item) => !notificationPreferences.doNotDisturb && notificationPreferences[preferenceForCategory[item.category] || 'applicationStatus'])

  const statusMatch = (item) => {
    if (filter === 'Semua') return true
    if (filter === 'Menunggu Pembina') return item.status_code === 'WAITING_PEMBINA' || item.status_code === 'SUBMITTED'
    if (filter === 'Menunggu Logistik') return item.status_code === 'WAITING_LOGISTIK' || item.status_code === 'REVISION_LOGISTIK'
    if (filter === 'Disetujui') return item.status_code === 'APPROVED_LOGISTIK' || item.status_code === 'ONGOING' || item.status_code === 'RETURN_REPORTED'
    if (filter === 'Ditolak') return item.status_code === 'REJECTED_PEMBINA' || item.status_code === 'REJECTED_LOGISTIK' || item.status_code === 'CANCELLED' || item.status_code === 'EXPIRED'
    return item.status_code === 'COMPLETED'
  }

  useEffect(() => {
    if (section !== 'riwayat') return
    let active = true
    apiListHistory('limit=100')
      .then((items) => {
        if (active) setHistoryRecords(items)
      })
      .catch(() => {
        if (active) setHistoryRecords(null)
      })
    return () => { active = false }
  }, [section])

  const sourceApplications = section === 'riwayat' && Array.isArray(historyRecords)
    ? historyRecords
    : submittedApplications

  const filtered = sourceApplications.filter((x) => (
    statusMatch(x)
    && (!dateStart || (x.event?.date || '') >= dateStart)
    && (!dateEnd || (x.event?.date || '') <= dateEnd)
    && `${x.id} ${x.nomor_pengajuan || ''} ${x.event?.name || ''} ${x.room?.name || ''}`.toLowerCase().includes(query.toLowerCase())
  ))

  const openDoc = (id, kind = 'sbp') => navigate(`/peminjam/dokumen/${id}?jenis=${kind}`, { state: { from: location.pathname } })
  const pageBack = () => navigate(-1)

  const handleDownloadSbp = async (target) => {
    setActionError('')
    try {
      await apiDownloadSbpPdf(target.id, target.sbp?.nomor_sbp)
    } catch (error) {
      setActionError(error.message)
    }
  }

  const handleCancel = async () => {
    if (!record || cancelling) return
    setCancelling(true)
    setActionError('')
    try {
      await cancelApplication(record.id, cancelNote.trim())
      setCancelOpen(false)
      setCancelNote('')
      await loadDetail(record.id)
    } catch (error) {
      setCancelOpen(false)
      setActionError(error.message)
    } finally {
      setCancelling(false)
    }
  }

  if (section === 'detail') {
    if (detailLoading && !record) return <div className="workflow-page"><Back to={location.state?.from || '/peminjam/pengajuan'} /><Card><p>Memuat detail pengajuan…</p></Card></div>
    if (!record) return <div className="workflow-page"><Back to={location.state?.from || '/peminjam/pengajuan'} /><Card><h1>Pengajuan tidak ditemukan</h1><p>Data pengajuan tidak tersedia.</p></Card></div>
    const canCancel = CANCELLABLE_CODES.has(record.status_code)
    const canViewSbp = Boolean(record.sbpPublished || record.sbp)
    const canOpenSbpg = record.status_code === 'ONGOING' || record.status_code === 'RETURN_REPORTED' || record.status_code === 'COMPLETED' || Boolean(record.sbpg)

    return (
      <div className="workflow-page">
        <Back to={location.state?.from || '/peminjam/pengajuan'} />
        <header className="workflow-heading">
          <p className="eyebrow">DETAIL PENGAJUAN</p>
          <h1>{record.event?.name}</h1>
          <p className="page-description">{record.nomor_pengajuan || record.id}</p>
        </header>
        <Card className="confirmation-section">
          <h2>Informasi kegiatan</h2>
          <InfoList rows={[
            ['Nomor pengajuan', record.nomor_pengajuan || record.id],
            ['Nama kegiatan', record.event?.name],
            ['Tujuan', record.event?.purpose],
            ['Jumlah peserta', `${record.event?.participants || 0} orang`],
            ['Jadwal', `${record.event?.date || ''}${record.event?.endDate && record.event.endDate !== record.event.date ? ` – ${record.event.endDate}` : ''} · ${formatTimeRange(record.event?.startTime, record.event?.endTime)}`],
            ['Peminjam', record.borrower?.name],
            ['WhatsApp', record.borrower?.whatsapp || '-'],
            ['Ruangan', record.room ? `${record.room.name} · ${record.room.building} · kapasitas ${record.room.capacity}` : '-'],
            ['Fasilitas ruangan', record.room?.equipment?.join(', ') || '-'],
            ['Logistik', (record.logistics || []).length ? record.logistics.map((x) => `${x.label} (${x.quantity} ${x.unit})`).join(', ') : 'Tidak ada'],
            ['Email Pembina', record.supervisorEmail],
            ['Status Pembina', record.pembina || record.supervisorStatus],
            ['Status Logistik', record.logistik || record.logisticsStatus],
            ['Catatan / Alasan', record.rejectionReason || record.logisticsNote || '-'],
            ['Nomor SBP', record.sbp?.nomor_sbp || 'Belum diterbitkan'],
          ]} />
        </Card>
        <Card className="confirmation-section">
          <h2>Riwayat status</h2>
          {record.history?.length ? (
            <ol className="request-timeline">
              {record.history.map((entry, idx) => (
                <li key={`${entry.to_status}-${idx}`}>
                  <strong>{entry.to_status}</strong> ({entry.actor_type}){entry.note ? ` — ${entry.note}` : ''}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="request-timeline">
              <li>{record.pembina || record.supervisorStatus}</li>
              <li>{record.logistik || record.logisticsStatus}</li>
            </ol>
          )}
          <Badge tone={record.status_code === 'COMPLETED' || record.status_code === 'ONGOING' || record.status_code === 'APPROVED_LOGISTIK' ? 'success' : record.status_code?.includes('REJECTED') ? 'danger' : 'warning'}>{record.status}</Badge>
        </Card>
        {actionError && <p className="logistik-error" role="alert">{actionError}</p>}
        <div className="workspace-actions">
          {canViewSbp && <Button onClick={() => openDoc(record.id)}>Lihat SBP</Button>}
          {canOpenSbpg && <Button variant="secondary" onClick={() => openDoc(record.id, 'sbpg')}>{record.sbpg || record.returned ? 'Lihat SBPG' : 'Isi SBPG'}</Button>}
          {canCancel && <Button variant="destructive" onClick={() => setCancelOpen(true)}><XCircle size={16} />Batalkan Pengajuan</Button>}
          <Button variant="secondary" onClick={pageBack}>Kembali ke daftar</Button>
        </div>
        <Modal open={cancelOpen} onClose={() => !cancelling && setCancelOpen(false)} title="Batalkan pengajuan ini?">
          <p className="modal-copy">Pengajuan yang dibatalkan tidak dapat diaktifkan kembali.</p>
          <label className="form-field">
            <span className="form-field__label">Catatan pembatalan (opsional)</span>
            <textarea className="form-control workflow-textarea" maxLength={500} value={cancelNote} onChange={(e) => setCancelNote(e.target.value)} />
          </label>
          <div className="modal-actions">
            <Button disabled={cancelling} variant="secondary" onClick={() => setCancelOpen(false)}>Tutup</Button>
            <Button disabled={cancelling} variant="destructive" onClick={handleCancel}>{cancelling ? 'Membatalkan…' : 'Ya, Batalkan'}</Button>
          </div>
        </Modal>
      </div>
    )
  }

  if (section === 'notifikasi-detail') {
    const n = notifications.find((x) => x.id === params.id)
    if (!n) return <div className="workflow-page"><Back to="/peminjam/notifikasi" /><Card><h1>Notifikasi tidak ditemukan</h1></Card></div>
    return (
      <div className="workflow-page">
        <Back to="/peminjam/notifikasi" />
        <header className="workflow-heading"><p className="eyebrow">{n.category}</p><h1>{n.title}</h1><p className="page-description">{n.date}</p></header>
        <Card>
          <p>{n.body}</p>
          {n.requestId && <Button onClick={() => navigate(`/peminjam/pengajuan/${n.requestId}`, { state: { from: location.pathname } })}>Lihat pengajuan</Button>}
        </Card>
      </div>
    )
  }

  if (section === 'dokumen') {
    const kind = new URLSearchParams(location.search).get('jenis') || 'sbp'
    if (detailLoading && !record) return <div className="workflow-page"><Back /><Card><p>Memuat dokumen…</p></Card></div>
    if (!record) return <div className="workflow-page"><Back /><Card><h1>Transaksi tidak ditemukan</h1></Card></div>
    const sbpAvailable = Boolean(record.sbpPublished || record.sbp)
    const sbpgAvailable = record.status_code === 'ONGOING' || record.status_code === 'RETURN_REPORTED' || record.status_code === 'COMPLETED' || Boolean(record.sbpg)

    if (kind === 'sbp' && !sbpAvailable) {
      return <div className="workflow-page"><Back to={location.state?.from || `/peminjam/pengajuan/${record.id}`} /><Card><h1>SBP belum tersedia</h1><p>SBP tersedia setelah disetujui Pembina dan Logistik serta diterbitkan oleh Logistik. Status saat ini: {record.status}.</p></Card></div>
    }
    if (kind === 'sbpg' && !sbpgAvailable) {
      return <div className="workflow-page"><Back to={location.state?.from || `/peminjam/pengajuan/${record.id}`} /><Card><h1>SBPG belum tersedia</h1><p>Laporan pengembalian dapat dibuat setelah SBP diterbitkan dan kegiatan berlangsung (status Dipinjam).</p></Card></div>
    }

    return (
      <div className="workflow-page">
        <Back to={location.state?.from || `/peminjam/pengajuan/${record.id}`} />
        <header className="workflow-heading">
          <p className="eyebrow">DOKUMEN · {record.nomor_pengajuan || record.id}</p>
          <h1>{kind === 'sbpg' ? 'SBPG · Pengembalian' : 'SBP · Peminjaman'}</h1>
        </header>
        {kind === 'sbp' ? (
          <>
            <Card className="document-preview">
              <h2>Surat Bukti Peminjaman</h2>
              <InfoList rows={[
                ['Nomor SBP', record.sbp?.nomor_sbp || `SBP-${record.id}`],
                ['Nomor pengajuan', record.nomor_pengajuan || record.id],
                ['Peminjam', record.borrower?.name],
                ['Kegiatan', record.event?.name],
                ['Jadwal', `${record.event?.date} · ${formatTimeRange(record.event?.startTime, record.event?.endTime)}`],
                ['Ruangan', record.room ? `${record.room.name}, ${record.room.building}` : '-'],
                ['Fasilitas', (record.logistics || []).length ? record.logistics.map((x) => `${x.label}: ${x.quantity} ${x.unit}`).join(', ') : 'Tidak ada'],
                ['Status persetujuan', `${record.pembina || record.supervisorStatus}; ${record.logistik || record.logisticsStatus}`],
              ]} />
            </Card>
            {actionError && <p className="logistik-error" role="alert">{actionError}</p>}
            <div className="workspace-actions">
              <Button onClick={() => window.print()}><Printer size={16} />Cetak</Button>
              <Button variant="secondary" onClick={() => handleDownloadSbp(record)}><Download size={16} />Unduh PDF SBP</Button>
              {sbpgAvailable && <Button variant="tertiary" onClick={() => openDoc(record.id, 'sbpg')}>{record.sbpg ? 'Lihat SBPG' : 'Isi SBPG'}</Button>}
            </div>
          </>
        ) : (
          <SbpgForm record={record} submitReturnReport={submitReturnReport} onSubmitted={() => loadDetail(record.id)} />
        )}
      </div>
    )
  }

  if (section === 'pengajuan' || section === 'riwayat') {
    return (
      <div className="workflow-page">
        <header className="workflow-heading">
          <p className="eyebrow">{section === 'pengajuan' ? 'PEMANTAUAN' : 'TRANSAKSI'}</p>
          <h1>{titleMap[section]}</h1>
          <p className="page-description">Daftar transaksi peminjaman Anda dari sistem kampus.</p>
        </header>
        <label className="workspace-search">
          <Search size={17} />
          <input aria-label="Cari nama kegiatan atau ruangan" placeholder="Cari kegiatan, ruangan, atau nomor" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <TransactionFilters
          status={draftFilter}
          setStatus={setDraftFilter}
          start={draftStart}
          setStart={setDraftStart}
          end={draftEnd}
          setEnd={setDraftEnd}
          onApply={() => { setFilter(draftFilter); setDateStart(draftStart); setDateEnd(draftEnd) }}
          onReset={() => { setQuery(''); setDraftFilter('Semua'); setDraftStart(''); setDraftEnd(''); setFilter('Semua'); setDateStart(''); setDateEnd('') }}
        />
        <div className="status-list">
          {filtered.length ? filtered.map((x) => (
            <button key={x.id} className="workspace-record" onClick={() => navigate(`/peminjam/pengajuan/${x.id}`, { state: { from: location.pathname } })}>
              <span className="workspace-record__icon"><ClipboardList size={18} /></span>
              <span className="workspace-record__body">
                <strong>{x.event?.name}</strong>
                <small>{x.room?.name || 'Ruangan'} · {x.event?.date} · {formatTimeRange(x.event?.startTime, x.event?.endTime)} · {x.event?.participants} peserta</small>
                <small>{x.nomor_pengajuan || x.id}</small>
                <Badge tone={x.status_code === 'COMPLETED' || x.status_code === 'ONGOING' || x.status_code === 'APPROVED_LOGISTIK' ? 'success' : x.status_code?.includes('REJECTED') ? 'danger' : 'warning'}>{x.status}</Badge>
              </span>
            </button>
          )) : (
            <Card><h2>Tidak ada transaksi ditemukan</h2><p>Belum ada pengajuan atau ubah filter pencarian.</p></Card>
          )}
        </div>
      </div>
    )
  }

  if (section === 'notifikasi') {
    return (
      <div className="workflow-page">
        <Back to={location.state?.from || '/peminjam'} />
        <header className="workflow-heading"><p className="eyebrow">PEMBARUAN</p><h1>Notifikasi</h1></header>
        <div className="workspace-actions">
          <Button variant="secondary" onClick={markAllNotificationsRead}><CheckCheck size={16} />Tandai semua dibaca</Button>
        </div>
        <div className="status-list">
          {visibleNotifications.length ? visibleNotifications.map((n) => (
            <button
              className={`workspace-record ${n.read ? 'is-read' : ''}`}
              key={n.id}
              onClick={() => {
                markNotificationRead(n)
                navigate(`/peminjam/notifikasi/${n.id}`, { state: { from: location.pathname } })
              }}
            >
              <span className="workspace-record__icon"><Bell size={18} /></span>
              <span className="workspace-record__body">
                <strong>{n.title}</strong>
                <small>{n.body}</small>
                <small>{n.category} · {n.date} · {n.read ? 'Dibaca' : 'Belum dibaca'}</small>
              </span>
              {!n.read && <span className="notification-dot" />}
            </button>
          )) : (
            <Card><h2>Tidak ada notifikasi yang tampil</h2><p>Belum ada notifikasi baru atau aktifkan preferensi notifikasi.</p></Card>
          )}
        </div>
      </div>
    )
  }

  return null
}
