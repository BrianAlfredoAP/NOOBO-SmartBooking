import { useState } from 'react'
import { Download, FileText, Search } from 'lucide-react'
import { Link, useLocation, useOutletContext } from 'react-router'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import { apiDownloadSbpPdf, apiGetSbpg } from '../../api/client.js'

function downloadSbpgSummary(record, sbpgDetail = null) {
  const sbpg = sbpgDetail || record.sbpg || {}
  const items = sbpgDetail?.items || record.return_details || []
  const itemLines = items.length
    ? items.map((d) => `- ${d.nama_ruangan ? `Ruangan ${d.nama_ruangan}` : d.nama_logistik || 'Item'}: kembali ${d.jumlah_dikembalikan} (${d.kondisi_kembali})`).join('\n')
    : '-'
  const body = [
    `SBPG · ${record.nomor_pengajuan || record.id}`,
    `Kegiatan: ${record.event?.name || sbpgDetail?.nama_kegiatan || '-'}`,
    `Status: ${record.status}`,
    `Ketepatan waktu: ${sbpg.status_ketepatan_waktu || '-'}`,
    `Catatan peminjam: ${sbpg.catatan_peminjam || '-'}`,
    `Detail item:\n${itemLines}`,
  ].join('\n')
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `SBPG-${record.nomor_pengajuan || record.id}.txt`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function DocumentsPage() {
  const location = useLocation()
  const { submittedApplications = [] } = useOutletContext()
  const [tab, setTab] = useState('sbp')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('Semua')
  const [downloadError, setDownloadError] = useState('')

  const statusFor = (record) => {
    if (tab === 'sbp') {
      if (record.sbpPublished || record.sbp) return 'Tersedia'
      if (record.status_code === 'APPROVED_LOGISTIK') return 'Menunggu penerbitan SBP'
      return record.status || 'Menunggu persetujuan'
    }
    if (record.status_code === 'COMPLETED') return 'Selesai'
    if (record.status_code === 'RETURN_REPORTED' || record.sbpg) return 'Menunggu Pemeriksaan Logistik'
    if (record.status_code === 'ONGOING') return 'Belum dilaporkan'
    return 'Belum memenuhi syarat'
  }

  const shown = submittedApplications.filter((record) => {
    const text = `${record.id} ${record.nomor_pengajuan || ''} ${record.event?.name || ''} ${record.room?.name || ''}`.toLowerCase()
    return text.includes(search.toLowerCase()) && (filter === 'Semua' || statusFor(record) === filter)
  })

  const openDocument = (record, kind) => `/peminjam/dokumen/${record.id}?jenis=${kind}`

  const handleDownload = async (record, kind) => {
    setDownloadError('')
    if (kind === 'sbpg') {
      try {
        const sbpgDetail = await apiGetSbpg(record.id)
        downloadSbpgSummary(record, sbpgDetail)
      } catch {
        downloadSbpgSummary(record)
      }
      return
    }
    try {
      await apiDownloadSbpPdf(record.id, record.sbp?.nomor_sbp)
    } catch (error) {
      setDownloadError(error.message)
    }
  }

  return (
    <div className="workflow-page">
      <header className="workflow-heading">
        <p className="eyebrow">ARSIP PEMINJAM</p>
        <h1>Dokumen Saya</h1>
        <p className="page-description">Akses Surat Bukti Peminjaman (SBP) resmi dan laporan pengembalian (SBPG).</p>
      </header>
      <div className="document-tabs" role="tablist" aria-label="Jenis dokumen">
        <button aria-selected={tab === 'sbp'} className={tab === 'sbp' ? 'is-active' : ''} onClick={() => { setTab('sbp'); setFilter('Semua') }} role="tab" type="button"><strong>SBP</strong><small>Surat Bukti Peminjaman</small></button>
        <button aria-selected={tab === 'sbpg'} className={tab === 'sbpg' ? 'is-active' : ''} onClick={() => { setTab('sbpg'); setFilter('Semua') }} role="tab" type="button"><strong>SBPG</strong><small>Surat Bukti Pengembalian</small></button>
      </div>
      <label className="workspace-search">
        <Search size={17} aria-hidden="true" />
        <input aria-label="Cari dokumen" placeholder="Cari kegiatan, ruangan, atau nomor" value={search} onChange={(event) => setSearch(event.target.value)} />
      </label>
      <label className="document-filter">
        <span>Filter status</span>
        <select value={filter} onChange={(event) => setFilter(event.target.value)}>
          {['Semua', ...new Set(submittedApplications.map(statusFor))].map((value) => <option key={value}>{value}</option>)}
        </select>
      </label>
      {downloadError && <p className="logistik-error" role="alert">{downloadError}</p>}
      <div className="document-list">
        {shown.length ? shown.map((record) => {
          const status = statusFor(record)
          const sbpAvailable = Boolean(record.sbpPublished || record.sbp)
          const sbpgAvailable = record.status_code === 'ONGOING' || record.status_code === 'RETURN_REPORTED' || record.status_code === 'COMPLETED' || Boolean(record.sbpg)
          const canOpen = tab === 'sbp' ? sbpAvailable : sbpgAvailable
          const canDownload = tab === 'sbp' ? sbpAvailable : Boolean(record.sbpg || record.returned)
          return (
            <Card className="document-list-item" key={`${tab}-${record.id}`}>
              <div className="document-list-item__icon"><FileText size={19} /></div>
              <div className="document-list-item__body">
                <p className="dashboard-section-kicker">{tab.toUpperCase()} · {record.sbp?.nomor_sbp || record.nomor_pengajuan || record.id}</p>
                <h2>{record.event?.name}</h2>
                <strong>{tab === 'sbp' ? 'Surat Bukti Peminjaman' : 'Surat Bukti Pengembalian'}</strong>
                <span>{record.room?.name || 'Ruangan'}</span>
                <span>{record.event?.date} · {record.event?.participants} peserta</span>
                <Badge tone={status === 'Tersedia' || status === 'Selesai' ? 'success' : 'warning'}>{status}</Badge>
              </div>
              <div className="document-list-item__actions">
                <Link
                  aria-disabled={!canOpen}
                  className={`document-view-link ${!canOpen ? 'is-disabled' : ''}`}
                  onClick={(event) => { if (!canOpen) event.preventDefault() }}
                  state={{ from: location.pathname }}
                  to={openDocument(record, tab)}
                >
                  {tab === 'sbpg' && record.status_code === 'ONGOING' && !record.sbpg ? 'Buat Laporan Pengembalian' : 'Lihat'}
                </Link>
                {canDownload && <Button onClick={() => handleDownload(record, tab)} type="button" variant="tertiary"><Download size={15} />Unduh</Button>}
              </div>
            </Card>
          )
        }) : (
          <Card className="workflow-empty"><h2>Dokumen tidak ditemukan</h2><p>Belum ada dokumen yang cocok dengan pencarian atau filter ini.</p></Card>
        )}
      </div>
    </div>
  )
}
