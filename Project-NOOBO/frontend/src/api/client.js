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

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const accessToken = sessionStorage.getItem(ACCESS_KEY)
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`

  let response
  try {
    response = await fetch(`${API_PREFIX}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  } catch {
    throw new Error('Layanan backend tidak dapat dihubungi. Pastikan backend Sprint 1 berjalan.')
  }

  if (response.status === 401 && auth && retry) {
    const refreshToken = sessionStorage.getItem(REFRESH_KEY)
    if (refreshToken) {
      try {
        const refreshed = await apiRequest('/auth/refresh', { method: 'POST', body: { refresh_token: refreshToken }, auth: false, retry: false })
        sessionStorage.setItem(ACCESS_KEY, refreshed.access_token)
        return apiRequest(path, { method, body, auth, retry: false })
      } catch {
        clearTokens()
      }
    }
  }

  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = Array.isArray(payload.message) ? payload.message.join(' ') : payload.message
    throw new Error(message || `Permintaan gagal (${response.status}).`)
  }
  return payload
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

export function mapRoomFromApi(room) {
  return { id: String(room.id_ruangan), name: room.nama_ruangan, code: String(room.id_ruangan), building: room.lokasi, floor: '', category: room.jenis, capacity: room.kapasitas, equipment: [], available: room.status_aktif, condition: room.kondisi_fasilitas || 'Baik', description: '', photo: '' }
}

export function mapInventoryFromApi(item) {
  return { id: String(item.id_logistik), name: item.nama_logistik, code: String(item.id_logistik), category: item.jenis, stock: item.stok_total, unit: 'unit', location: 'Gudang Logistik', available: item.status_aktif, condition: item.kondisi_fasilitas || 'Baik', description: '', photo: '' }
}
