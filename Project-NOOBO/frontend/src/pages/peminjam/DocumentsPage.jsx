import { useMemo, useState } from 'react'
import { Download, FileText, Search } from 'lucide-react'
import { Link, useLocation, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { demoRecords } from '../../data/peminjam-workspace-demo.js'
import { formatTimeRange } from '../../utils/time-format.js'

function dateAndTime(record) {
  const day = record.event.endDate || record.event.date
  return Date.parse(`${day}T${record.event.endTime}:00+07:00`)
}

function makeDownload(record, kind, report) {
  const body = kind === 'sbp'
    ? [
      'DOKUMEN SIMULASI — BUKAN SBP RESMI', `ID: SBP-${record.id}`,
      `Peminjam: ${record.borrower.name}`, `Kegiatan: ${record.event.name}`,
      `Jadwal: ${record.event.date} ${formatTimeRange(record.event.startTime, record.event.endTime)}`,
      `Ruangan: ${record.room.name} (${record.room.building})`,
      `Logistik: ${record.logistics.map((item) => `${item.label} ${item.quantity} ${item.unit}`).join(', ')}`,
    ].join('\n')
    : ['DOKUMEN SIMULASI — BUKAN SBPG RESMI', `ID transaksi: ${record.id}`, `Kegiatan: ${record.event.name}`, `Status: ${report ? 'Menunggu Pemeriksaan Logistik' : 'Belum dikirim'}`, report ? `Jumlah kembali: ${report.items.map((item) => `${item.label} ${item.returnedQuantity}`).join(', ')}` : ''].join('\n')
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${kind.toUpperCase()}-${record.id}.txt`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function DocumentsPage() {
  const location=useLocation()
  const { submittedApplications = [], returnReports = {}, logisticsDecisions = {} } = useOutletContext()
  const [currentTime] = useState(() => Date.now())
  const [tab, setTab] = useState('sbp')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const records = useMemo(() => [
    ...submittedApplications.map((item) => ({ ...item, canIssueSbp: Boolean(item.sbpPublished), returned: Boolean(item.returned) })),
    ...demoRecords.map((item) => ({ ...item, ...(logisticsDecisions[item.id] || {}), canIssueSbp: Boolean(logisticsDecisions[item.id]?.sbpPublished ?? item.canIssueSbp), returnReport: returnReports[item.id] })),
  ], [submittedApplications, returnReports, logisticsDecisions])
  const statusFor = (record) => {
    if (tab === 'sbp') return record.canIssueSbp ? 'Tersedia · simulasi' : record.status === 'Disetujui' ? 'Menunggu penerbitan SBP' : 'Menunggu persetujuan Logistik'
    if (record.returnReport) {
      if (record.returnReport.logisticsInspection?.status === 'Selesai') return 'Selesai · simulasi'
      const complete = record.returnReport.items.every((item) => Number(item.returnedQuantity) === Number(item.quantity) && item.condition === 'Baik')
      return `${complete ? 'Lengkap' : 'Tidak Lengkap'} · Menunggu Pemeriksaan Logistik`
    }
    if (record.returned) return 'Selesai · simulasi'
    if (!record.canIssueSbp || currentTime < dateAndTime(record)) return 'Belum memenuhi syarat'
    return 'Belum dilaporkan'
  }
  const shown = records.filter((record) => {
    const text = `${record.id} ${record.event.name} ${record.room.name}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (filter === 'Semua' || statusFor(record) === filter)
  })
  const openDocument = (record, kind) => `/peminjam/dokumen/${record.id}?jenis=${kind}`

  return <div className="workflow-page">
    <header className="workflow-heading"><p className="eyebrow">ARSIP PEMINJAM</p><h1>Dokumen Saya</h1><p className="page-description">Dokumen demonstrasi mengikuti transaksi yang sama dengan menu Peminjaman.</p></header>
    <div className="document-tabs" role="tablist" aria-label="Jenis dokumen">
      <button aria-selected={tab === 'sbp'} className={tab === 'sbp' ? 'is-active' : ''} onClick={() => { setTab('sbp'); setFilter('Semua') }} role="tab" type="button"><strong>SBP</strong><small>Surat Bukti Peminjaman</small></button>
      <button aria-selected={tab === 'sbpg'} className={tab === 'sbpg' ? 'is-active' : ''} onClick={() => { setTab('sbpg'); setFilter('Semua') }} role="tab" type="button"><strong>SBPG</strong><small>Surat Bukti Pengembalian</small></button>
    </div>
    <label className="workspace-search"><Search size={17} aria-hidden="true"/><input aria-label="Cari dokumen" placeholder="Cari kegiatan, ruangan, atau ID" value={search} onChange={(event) => setSearch(event.target.value)}/></label>
    <label className="document-filter"><span>Filter status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}>{['Semua', ...new Set(records.map(statusFor))].map((value) => <option key={value}>{value}</option>)}</select></label>
    <div className="document-list">{shown.length ? shown.map((record) => {
      const status = statusFor(record)
      const sbpAvailable = record.canIssueSbp
      const sbpgAvailable = record.canIssueSbp && currentTime >= dateAndTime(record)
      const report = record.returnReport
      return <Card className="document-list-item" key={`${tab}-${record.id}`}>
        <div className="document-list-item__icon"><FileText size={19}/></div>
        <div className="document-list-item__body"><p className="dashboard-section-kicker">{tab.toUpperCase()} · {record.id}</p><h2>{record.event.name}</h2><strong>{tab === 'sbp' ? 'Surat Bukti Peminjaman' : 'Surat Bukti Pengembalian'}</strong><span>{record.room.name}</span><span>{record.event.date} · {record.event.participants} peserta</span><Badge tone={status.includes('Tersedia') || status.includes('Selesai') ? 'success' : 'warning'}>{status}</Badge></div>
        <div className="document-list-item__actions">
          <Link aria-disabled={tab === 'sbp' ? !sbpAvailable : !sbpgAvailable} className={`document-view-link ${(tab === 'sbp' ? !sbpAvailable : !sbpgAvailable) ? 'is-disabled' : ''}`} onClick={(event) => { if (tab === 'sbp' ? !sbpAvailable : !sbpgAvailable) event.preventDefault() }} state={{from:location.pathname}} to={openDocument(record, tab)}>{tab === 'sbpg' && sbpgAvailable && !report && !record.returned ? 'Buat Laporan Pengembalian' : 'Lihat'}</Link>
          {(tab === 'sbp' ? sbpAvailable : Boolean(report || record.returned)) && <Button onClick={() => makeDownload(record, tab, report)} type="button" variant="tertiary"><Download size={15}/>Unduh</Button>}
        </div>
      </Card>
    }) : <Card className="workflow-empty"><h2>Dokumen tidak ditemukan</h2><p>Belum ada dokumen yang cocok dengan pencarian atau filter ini.</p></Card>}</div>
    <p className="demo-disclaimer">SBP hanya tersedia setelah persetujuan Pembina dan Logistik. Ketersediaan SBPG mengikuti jadwal simulasi. Dokumen di sini bukan dokumen resmi.</p>
  </div>
}
