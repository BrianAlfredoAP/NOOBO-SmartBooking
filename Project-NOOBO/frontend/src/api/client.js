const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')
const API_PREFIX = API_BASE_URL ? `${API_BASE_URL}/api/v1` : '/api/v1'
const ACCESS_KEY = 'noobo-access-token'
const REFRESH_KEY = 'noobo-refresh-token'

export function saveTokens({ access_token, refresh_token }) {
  sessionStorage.setItem(ACCESS_KEY, access_token)
  if (refresh_token) sessionStorage.setItem(REFRESH_KEY, refresh_token)
}

export function clearTokens() {
  sessionStorage.removeItem(ACCESS_KEY)
  sessionStorage.removeItem(REFRESH_KEY)
}

function buildError(payload, status) {
  const baseMessage = Array.isArray(payload?.message) ? payload.message.join(' ') : payload?.message
  const details = Array.isArray(payload?.errors) && payload.errors.length ? payload.errors : []
  const text = details.length && baseMessage
    ? `${baseMessage}: ${details.join('; ')}`
    : baseMessage || `Permintaan gagal (${status}).`
  const error = new Error(text)
  error.status = status
  error.code = payload?.code || ''
  error.details = details
  return error
}

async function tryRefreshToken() {
  const refreshToken = sessionStorage.getItem(REFRESH_KEY)
  if (!refreshToken) return false
  try {
    const refreshed = await apiRequest('/auth/refresh', {
      method: 'POST',
      body: { refresh_token: refreshToken },
      auth: false,
      retry: false,
    })
    sessionStorage.setItem(ACCESS_KEY, refreshed.access_token)
    return true
  } catch {
    clearTokens()
    return false
  }
}

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const accessToken = sessionStorage.getItem(ACCESS_KEY)
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new Error('Layanan backend tidak dapat dihubungi. Pastikan server backend berjalan.')
  }

  if (response.status === 401 && auth && retry && (await tryRefreshToken())) {
    return apiRequest(path, { method, body, auth, retry: false })
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw buildError(payload, response.status)
  return payload
}

export async function apiBlob(path, { auth = true, retry = true } = {}) {
  const headers = {}
  const accessToken = sessionStorage.getItem(ACCESS_KEY)
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, { method: 'GET', headers })
  } catch {
    throw new Error('Layanan backend tidak dapat dihubungi. Pastikan server backend berjalan.')
  }

  if (response.status === 401 && auth && retry && (await tryRefreshToken())) {
    return apiBlob(path, { auth, retry: false })
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}))
    throw buildError(payload, response.status)
  }
  return response.blob()
}

export async function apiLogin(email, password) {
  const session = await apiRequest('/auth/login', { method: 'POST', auth: false, body: { email, password } })
  saveTokens(session)
  return session.user
}

export async function apiLogout() {
  const refresh_token = sessionStorage.getItem(REFRESH_KEY)
  try {
    if (refresh_token) await apiRequest('/auth/logout', { method: 'POST', body: { refresh_token } })
  } finally {
    clearTokens()
  }
}

export async function apiMe() {
  return apiRequest('/auth/me')
}

export async function apiGetProfile() {
  const res = await apiRequest('/users/me')
  return res.data || res
}

export async function apiUpdateProfile(body) {
  const res = await apiRequest('/users/me', { method: 'PATCH', body })
  return res.data || res
}

export async function apiListRooms(params = 'limit=100') {
  const res = await apiRequest(`/rooms?${params}`)
  return (res.data || []).map(mapRoomFromApi)
}

export async function apiListLogisticItems(params = 'limit=100') {
  const res = await apiRequest(`/logistic-items?${params}`)
  return (res.data || []).map(mapInventoryFromApi)
}

export async function apiListPembina(params = 'limit=100&status_aktif=true') {
  const res = await apiRequest(`/pembina?${params}`)
  return (res.data || []).map(mapPembinaFromApi)
}

export async function apiCreateFsk(body) {
  const res = await apiRequest('/fsk', { method: 'POST', body })
  return res.data
}

export async function apiUpdateFsk(id, body) {
  const res = await apiRequest(`/fsk/${id}`, { method: 'PUT', body })
  return res.data
}

export async function apiGenerateRecommendations(fskId) {
  const res = await apiRequest(`/fsk/${fskId}/recommendations`, { method: 'POST' })
  return res.data || []
}

export async function apiSelectPackage(fskId, idPaket) {
  const res = await apiRequest(`/fsk/${fskId}/select-package`, {
    method: 'POST',
    body: { id_paket: Number(idPaket) },
  })
  return res.data
}

export async function apiGetLoanRequestDraft(fskId) {
  const res = await apiRequest(`/loan-requests/draft/${fskId}`)
  return res.data
}

export async function apiCreateLoanRequest(body) {
  const res = await apiRequest('/loan-requests', { method: 'POST', body })
  return res.data
}

export async function apiCancelLoanRequest(id, catatan) {
  const res = await apiRequest(`/loan-requests/${id}/cancel`, {
    method: 'POST',
    body: catatan ? { catatan } : {},
  })
  return res.data
}

export async function apiListMyLoanRequests(limit = 100) {
  const res = await apiRequest(`/me/loan-requests?limit=${limit}`)
  return res.data || []
}

export async function apiGetMyLoanRequest(id) {
  const res = await apiRequest(`/me/loan-requests/${id}`)
  return res.data
}

export async function apiGetReturnForm(id) {
  const res = await apiRequest(`/me/loan-requests/${id}/return-form`)
  return res.data
}

export async function apiGetSbpg(id) {
  const res = await apiRequest(`/me/loan-requests/${id}/sbpg`)
  return res.data
}

export async function apiSubmitReturn(id, body) {
  const res = await apiRequest(`/me/loan-requests/${id}/sbpg`, { method: 'POST', body })
  return res.data
}

export async function apiDownloadSbpPdf(id, nomorSbp) {
  const blob = await apiBlob(`/me/loan-requests/${id}/sbp`)
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${nomorSbp || `SBP-${id}`}.pdf`
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function apiListNotifications() {
  const res = await apiRequest('/notifications')
  return (res.data || []).map(mapNotificationFromApi)
}

export async function apiMarkNotificationRead(id) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' })
}

export async function apiMarkAllNotificationsRead() {
  return apiRequest('/notifications/read-all', { method: 'POST' })
}

export async function apiGetApproval(token) {
  const res = await apiRequest(`/approvals/${encodeURIComponent(token)}`, { auth: false })
  return res
}

export async function apiSubmitApprovalDecision(token, body) {
  const res = await apiRequest(`/approvals/${encodeURIComponent(token)}/decision`, {
    method: 'POST',
    auth: false,
    body,
  })
  return res
}

export async function apiListAllLoanRequests(limit = 100) {
  const res = await apiRequest(`/loan-requests?limit=${limit}`)
  return res.data || []
}

export async function apiListHistory(params = 'limit=100') {
  const res = await apiRequest(`/history?${params}`)
  return res.data || []
}

export async function apiGetLogisticsRequestDetail(id) {
  const res = await apiRequest(`/logistics/loan-requests/${id}`)
  return res.data
}

export async function apiSubmitLogisticsDecision(id, body) {
  const res = await apiRequest(`/logistics/loan-requests/${id}/decision`, { method: 'POST', body })
  return res.data
}

export async function apiIssueSbp(id) {
  const res = await apiRequest(`/logistics/loan-requests/${id}/sbp`, { method: 'POST' })
  return res.data
}

export async function apiListLogisticsReturns(params = 'status=PENDING_INSPECTION&limit=100') {
  const res = await apiRequest(`/logistics/returns?${params}`)
  return res.data || []
}

export async function apiGetLogisticsReturnDetail(id) {
  const res = await apiRequest(`/logistics/returns/${id}`)
  return res.data
}

export async function apiRecordInspection(id, body) {
  const res = await apiRequest(`/logistics/returns/${id}/inspection`, { method: 'POST', body })
  return res.data
}

export async function apiSubmitInspection(id, body) {
  await apiRequest(`/logistics/returns/${id}/inspection`, { method: 'POST', body })
  const res = await apiRequest(`/logistics/returns/${id}/complete`, { method: 'POST', body })
  return res.data
}

function parseList(value) {
  if (Array.isArray(value)) return value.map(String)
  if (typeof value !== 'string' || !value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export function mapRoomFromApi(room) {
  return {
    id: String(room.id_ruangan),
    name: room.nama_ruangan,
    code: room.kode_ruangan || String(room.id_ruangan),
    building: room.gedung || room.lokasi || '',
    floor: room.lantai || '',
    category: room.jenis || '',
    capacity: Number(room.kapasitas || 0),
    equipment: parseList(room.fasilitas),
    available: Boolean(room.status_aktif),
    condition: room.kondisi_fasilitas || 'Baik',
    description: room.deskripsi || '',
    photo: room.foto || '',
  }
}

export function mapInventoryFromApi(item) {
  return {
    id: String(item.id_logistik),
    name: item.nama_logistik,
    code: item.kode_logistik || String(item.id_logistik),
    category: item.jenis || '',
    stock: Number(item.stok_total || 0),
    unit: item.satuan || 'unit',
    location: item.lokasi || 'Gudang Logistik',
    available: Boolean(item.status_aktif),
    condition: item.kondisi_fasilitas || 'Baik',
    description: item.deskripsi || '',
    photo: item.foto || '',
  }
}

export function mapPembinaFromApi(item) {
  return {
    id: Number(item.pembinaId ?? item.id_pembina),
    name: item.nama ?? item.nama_pembina ?? '',
    email: item.email ?? item.email_pembina ?? '',
    active: Boolean(item.status ?? item.status_aktif ?? true),
  }
}

export function mapNotificationFromApi(item) {
  const dateObj = item.date ? new Date(item.date) : null
  const formattedDate = dateObj && !Number.isNaN(dateObj.getTime())
    ? dateObj.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' })
    : String(item.date || '')
  return {
    id: String(item.id || `n-${item.id_notifikasi}`),
    rawId: Number(item.id_notifikasi),
    title: item.title || '',
    body: item.body || '',
    category: item.category || 'Pengajuan',
    requestId: item.requestId != null ? String(item.requestId) : '',
    read: Boolean(item.read),
    date: formattedDate,
  }
}

export function mapRecommendationPackage(pkg, participants = 0) {
  const ruangan = pkg.ruangan || pkg.snapshot?.ruangan || {}
  const snapshotLogistics = Array.isArray(pkg.snapshot?.logistik) ? pkg.snapshot.logistik : []
  const rawLogistics = Array.isArray(pkg.logistik) && pkg.logistik.length ? pkg.logistik : snapshotLogistics
  const capacity = Number(ruangan.kapasitas || 0)
  const buildingParts = [ruangan.gedung || ruangan.lokasi, ruangan.lantai ? `Lantai ${ruangan.lantai}` : ''].filter(Boolean)

  return {
    id: String(pkg.id_paket),
    packageId: Number(pkg.id_paket),
    packageName: pkg.nama_paket,
    roomId: ruangan.id_ruangan != null ? String(ruangan.id_ruangan) : '',
    name: ruangan.nama_ruangan || pkg.nama_paket,
    code: ruangan.kode_ruangan || '',
    building: buildingParts.join(' · ') || 'Kampus',
    capacity,
    equipment: parseList(ruangan.fasilitas),
    condition: ruangan.kondisi_fasilitas || 'Baik',
    available: ruangan.status_aktif !== undefined ? Boolean(ruangan.status_aktif) : true,
    fits: capacity >= Number(participants || 0),
    score: Number(pkg.skor || 0),
    reason: pkg.alasan || '',
    logistics: rawLogistics.map((item) => {
      const snap = snapshotLogistics.find((s) => Number(s.id_logistik) === Number(item.id_logistik))
      return {
        id: String(item.id_logistik),
        label: item.nama_logistik || snap?.nama_logistik || 'Barang',
        quantity: Number(item.jumlah || snap?.jumlah || 0),
        unit: item.satuan || snap?.satuan || 'unit',
        availableStock: snap?.stok_tersedia != null ? Number(snap.stok_tersedia) : Number(item.stok_total ?? 0),
      }
    }),
  }
}
