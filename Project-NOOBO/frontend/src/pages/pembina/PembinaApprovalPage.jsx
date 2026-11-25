import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { CheckCircle2, ClipboardCheck, XCircle } from 'lucide-react'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Card from '../../components/ui/Card.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Brand from '../../components/layout/Brand.jsx'
import { apiGetApproval, apiSubmitApprovalDecision } from '../../api/client.js'
import { formatTimeRange } from '../../utils/time-format.js'

function formatDate(value) {
  if (!value) return '-'
  return String(value).slice(0, 10)
}

function PembinaApprovalPage() {
  const { token } = useParams()
  const [loading, setLoading] = useState(() => Boolean(token))
  const [error, setError] = useState(() => (token ? '' : 'Tautan persetujuan tidak tersedia.'))
  const [approval, setApproval] = useState(null)
  const [decisionModal, setDecisionModal] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [doneMessage, setDoneMessage] = useState('')

  useEffect(() => {
    if (!token) return
    let active = true
    apiGetApproval(token)
      .then((res) => {
        if (active) {
          setApproval(res.data)
          setError('')
        }
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [token])

  const submitDecision = async () => {
    if (submitting || !decisionModal) return
    if (decisionModal === 'REJECT' && !reason.trim()) {
      setSubmitError('Alasan wajib diisi saat menolak pengajuan.')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await apiSubmitApprovalDecision(token, {
        decision: decisionModal,
        reason: reason.trim() || undefined,
      })
      setDoneMessage(res.message || 'Keputusan berhasil disimpan.')
      setDecisionModal('')
      setReason('')
      const updated = await apiGetApproval(token).catch(() => null)
      if (updated?.data) setApproval(updated.data)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pengajuan = approval?.pengajuan
  const tokenInfo = approval?.token
  const isUsed = tokenInfo?.status === 'USED'
  const canDecide = tokenInfo?.status === 'UNUSED' && pengajuan?.status === 'WAITING_PEMBINA'

  return (
    <main className="approval-page">
      <header className="approval-header">
        <Brand />
      </header>

      {loading && (
        <Card className="approval-placeholder">
          <span className="empty-panel__icon"><ClipboardCheck size={22} aria-hidden="true" /></span>
          <p className="eyebrow">HALAMAN PEMBINA</p>
          <h1>Memuat detail pengajuan…</h1>
        </Card>
      )}

      {!loading && error && (
        <Card className="approval-placeholder">
          <span className="empty-panel__icon"><XCircle size={22} aria-hidden="true" /></span>
          <p className="eyebrow">HALAMAN PEMBINA</p>
          <h1>Tautan tidak dapat diproses</h1>
          <p className="logistik-error" role="alert">{error}</p>
        </Card>
      )}

      {!loading && !error && pengajuan && (
        <div className="workflow-page">
          <header className="workflow-heading">
            <p className="eyebrow">PERSETUJUAN PEMBINA · {pengajuan.nomor_pengajuan}</p>
            <h1>{pengajuan.nama_kegiatan}</h1>
            <p className="page-description">Tinjau detail permohonan peminjaman ruangan dan logistik kampus sebelum memberikan keputusan.</p>
          </header>

          {doneMessage && <Card><Badge tone="success">{doneMessage}</Badge></Card>}

          {isUsed && (
            <Card>
              <Badge tone={tokenInfo.keputusan === 'APPROVE' ? 'success' : 'danger'}>
                Keputusan sudah tercatat: {tokenInfo.keputusan === 'APPROVE' ? 'Disetujui' : 'Ditolak'}
              </Badge>
              {tokenInfo.alasan && <p>Alasan: {tokenInfo.alasan}</p>}
              {tokenInfo.waktu_digunakan && (
                <p>Dicatat pada: {new Date(tokenInfo.waktu_digunakan).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })} WIB</p>
              )}
            </Card>
          )}

          <Card className="confirmation-section">
            <h2>Informasi Pengajuan</h2>
            <dl className="confirmation-details">
              <div><dt>Nomor pengajuan</dt><dd>{pengajuan.nomor_pengajuan}</dd></div>
              <div><dt>Peminjam</dt><dd>{pengajuan.peminjam?.nama} ({pengajuan.peminjam?.email})</dd></div>
              <div><dt>Pembina</dt><dd>{pengajuan.pembina?.nama_pembina} ({pengajuan.pembina?.email_pembina})</dd></div>
              <div><dt>Nama kegiatan</dt><dd>{pengajuan.nama_kegiatan}</dd></div>
              <div><dt>Tujuan</dt><dd>{pengajuan.tujuan_kegiatan}</dd></div>
              <div><dt>Jumlah peserta</dt><dd>{pengajuan.jumlah_peserta} orang</dd></div>
              <div><dt>Jadwal</dt><dd>{formatDate(pengajuan.tanggal_mulai)}{formatDate(pengajuan.tanggal_selesai) !== formatDate(pengajuan.tanggal_mulai) ? ` – ${formatDate(pengajuan.tanggal_selesai)}` : ''} · {formatTimeRange(pengajuan.waktu_mulai, pengajuan.waktu_selesai)}</dd></div>
              <div><dt>Ruangan</dt><dd>{pengajuan.paket?.ruangan?.nama_ruangan ? `${pengajuan.paket.ruangan.nama_ruangan} (${pengajuan.paket.ruangan.lokasi || '-'})` : '-'}</dd></div>
              <div><dt>Logistik</dt><dd>{pengajuan.paket?.logistik?.length ? pengajuan.paket.logistik.map((item) => `${item.nama_logistik} (${item.jumlah})`).join(', ') : 'Tidak ada tambahan'}</dd></div>
            </dl>
          </Card>

          {canDecide && (
            <div className="workspace-actions">
              <Button onClick={() => { setDecisionModal('APPROVE'); setReason(''); setSubmitError('') }} type="button">
                <CheckCircle2 size={16} />Setujui Pengajuan
              </Button>
              <Button onClick={() => { setDecisionModal('REJECT'); setReason(''); setSubmitError('') }} type="button" variant="destructive">
                <XCircle size={16} />Tolak Pengajuan
              </Button>
            </div>
          )}

          <Modal
            open={Boolean(decisionModal)}
            onClose={() => !submitting && setDecisionModal('')}
            title={decisionModal === 'APPROVE' ? 'Setujui pengajuan peminjaman?' : 'Tolak pengajuan peminjaman?'}
          >
            <p className="modal-copy">
              {decisionModal === 'APPROVE'
                ? 'Pengajuan akan diteruskan ke Logistik Kampus untuk verifikasi ketersediaan.'
                : 'Pengajuan akan ditolak dan peminjam akan menerima notifikasi email.'}
            </p>
            <label className="form-field">
              <span className="form-field__label">{decisionModal === 'REJECT' ? 'Alasan penolakan (wajib)' : 'Catatan (opsional)'}</span>
              <textarea
                className="form-control logistik-textarea"
                maxLength={1000}
                onChange={(event) => { setReason(event.target.value); setSubmitError('') }}
                value={reason}
              />
              {submitError && <small className="form-field__message form-field__message--error">{submitError}</small>}
            </label>
            <div className="modal-actions">
              <Button disabled={submitting} onClick={() => setDecisionModal('')} type="button" variant="secondary">Batal</Button>
              <Button disabled={submitting} onClick={submitDecision} type="button" variant={decisionModal === 'REJECT' ? 'destructive' : 'primary'}>
                {submitting ? 'Menyimpan…' : decisionModal === 'APPROVE' ? 'Ya, Setujui' : 'Ya, Tolak'}
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </main>
  )
}

export default PembinaApprovalPage
