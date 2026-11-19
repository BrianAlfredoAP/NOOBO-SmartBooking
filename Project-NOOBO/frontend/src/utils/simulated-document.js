import { formatTimeRange } from './time-format.js'

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character])
}

export function buildSimulatedApplicationHtml({ fsk, room, logistics, supervisorEmail }) {
  const logisticsRows = logistics.length
    ? logistics.map((item) => `<li>${escapeHtml(item.label)} — ${escapeHtml(item.quantity)} ${escapeHtml(item.unit)}</li>`).join('')
    : '<li>Tidak ada logistik tambahan</li>'

  return `<!doctype html>
<html lang="id">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>NOOBO - Dokumen Pengajuan Simulasi</title>
<style>body{font:14px/1.6 Inter,Arial,sans-serif;color:#182b42;max-width:760px;margin:40px auto;padding:0 24px}h1{color:#153d70;font-size:22px}h2{margin-top:24px;font-size:16px}small,.notice{color:#65758b}.notice{padding:12px;background:#eef5fc;border-left:3px solid #2463a6}dl{display:grid;grid-template-columns:160px 1fr;gap:8px}dt{color:#65758b}dd{margin:0}</style></head>
<body><p class="notice">DOKUMEN SIMULASI — bukan dokumen resmi dan tidak dikirim ke backend.</p>
<h1>Dokumen Pengajuan Peminjaman</h1><small>Nomor preview: NOOBO-SIM-DRAFT</small>
<h2>Data Peminjam</h2><dl><dt>Nama</dt><dd>${escapeHtml(fsk.borrowerName)}</dd><dt>Organisasi</dt><dd>${escapeHtml(fsk.organization)}</dd><dt>Nomor WhatsApp</dt><dd>${escapeHtml(fsk.whatsapp || 'Tidak dicantumkan')}</dd><dt>Email Pembina</dt><dd>${escapeHtml(supervisorEmail)}</dd></dl>
<h2>Informasi Kegiatan</h2><dl><dt>Nama kegiatan</dt><dd>${escapeHtml(fsk.eventName)}</dd><dt>Tujuan</dt><dd>${escapeHtml(fsk.purpose || 'Tidak dicantumkan')}</dd><dt>Peserta</dt><dd>${escapeHtml(fsk.participants)}</dd><dt>Tanggal</dt><dd>${escapeHtml(fsk.date)}</dd><dt>Waktu</dt><dd>${escapeHtml(formatTimeRange(fsk.startTime, fsk.endTime))}</dd></dl>
<h2>Ruangan Pilihan (Simulasi)</h2><dl><dt>Ruangan</dt><dd>${escapeHtml(room.name)}</dd><dt>Lokasi</dt><dd>${escapeHtml(room.building)}</dd><dt>Kapasitas</dt><dd>${escapeHtml(room.capacity)} orang</dd></dl>
<h2>Logistik Pilihan (Simulasi)</h2><ul>${logisticsRows}</ul>
</body></html>`
}

export function simulatedDocumentFileName() {
  return 'NOOBO-Dokumen-Pengajuan-Simulasi.html'
}
