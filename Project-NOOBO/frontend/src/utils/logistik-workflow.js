export function isAwaitingLogistics(request, decisions = {}) {
  const supervisorStatus = String(request.supervisorStatus || request.pembina || '')
  if (!/disetujui/i.test(supervisorStatus) || /menunggu/i.test(supervisorStatus)) return false

  const logisticsStatus = String(
    decisions[request.id]?.status || request.logisticsStatus || request.logistik || '',
  )
  if (/menunggu.*logistik|menunggu pemeriksaan/i.test(logisticsStatus)) return true
  if (decisions[request.id]?.status) return false
  if (logisticsStatus) return false

  const status = String(request.status || '')
  return !/disetujui|ditolak|selesai|perbaikan|dipinjam/i.test(status)
}
