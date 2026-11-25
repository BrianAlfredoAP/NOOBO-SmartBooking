import { useCallback, useEffect, useState } from 'react'
import { ClipboardCheck, ClipboardList, Database, House, LogOut, UserRound } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import Brand from './Brand.jsx'
import PageContainer from './PageContainer.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/auth-context.js'
import { demoLogistikUser } from '../../data/logistik-demo.js'
import { isAwaitingLogistics } from '../../utils/logistik-workflow.js'
import {
  apiDownloadSbpPdf,
  apiIssueSbp,
  apiListAllLoanRequests,
  apiListLogisticItems,
  apiListRooms,
  apiRequest,
  apiSubmitInspection,
  apiSubmitLogisticsDecision,
} from '../../api/client.js'

const navItems = [
  ['/logistik', 'Beranda', House],
  ['/logistik/data', 'Data', Database],
  ['/logistik/pengajuan', 'Pengajuan', ClipboardList],
  ['/logistik/pemeriksaan', 'Pemeriksaan', ClipboardCheck],
  ['/logistik/profil', 'Profil', UserRound],
]

function initialsOf(name) {
  return (name || 'LG').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'LG'
}

function LogistikLayout() {
  const { user, endDemoSession, loading: sessionLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [rooms, setRooms] = useState([])
  const [inventory, setInventory] = useState([])
  const [applications, setApplications] = useState([])
  const [dataError, setDataError] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)

  const refreshRequests = useCallback(async () => {
    const list = await apiListAllLoanRequests(100)
    setApplications(list)
    return list
  }, [])

  const isLogistikUser = user?.role === 'logistik'
  const userEmail = user?.email

  useEffect(() => {
    if (!isLogistikUser) return
    let active = true
    Promise.all([apiListRooms('limit=100'), apiListLogisticItems('limit=100'), apiListAllLoanRequests(100)])
      .then(([roomList, inventoryList, requestList]) => {
        if (!active) return
        setRooms(roomList)
        setInventory(inventoryList)
        setApplications(requestList)
        setDataError('')
      })
      .catch((error) => {
        if (active) setDataError(error.message)
      })
      .finally(() => {
        if (active) setDataLoading(false)
      })
    return () => { active = false }
  }, [isLogistikUser, userEmail])

  if (sessionLoading) return null
  if (!user || user.role !== 'logistik') return <Navigate to="/auth" replace />

  const pendingApplicationCount = applications.filter((request) => isAwaitingLogistics(request)).length
  const profile = { ...demoLogistikUser, name: user.name, email: user.email, initials: initialsOf(user.name) }
  const logout = async () => { setLogoutOpen(false); await endDemoSession(); navigate('/auth', { replace: true }) }

  const saveResource = async (kind, item, existingId) => {
    const room = kind === 'room'
    const safePhoto = typeof item.photo === 'string' && item.photo.length > 0 && item.photo.length <= 255 ? item.photo : undefined
    const payload = room
      ? {
          nama_ruangan: item.name,
          jenis: item.category || 'Ruangan',
          lokasi: item.building,
          kapasitas: Number(item.capacity),
          kondisi_fasilitas: item.condition,
          ...(item.code ? { kode_ruangan: item.code } : {}),
          ...(item.building ? { gedung: item.building } : {}),
          ...(item.floor ? { lantai: item.floor } : {}),
          ...(Array.isArray(item.equipment) ? { fasilitas: item.equipment } : {}),
          ...(item.description ? { deskripsi: item.description } : {}),
          ...(safePhoto ? { foto: safePhoto } : {}),
        }
      : {
          nama_logistik: item.name,
          jenis: item.category,
          stok_total: Number(item.stock),
          kondisi_fasilitas: item.condition,
          ...(item.code ? { kode_logistik: item.code } : {}),
          ...(item.location ? { lokasi: item.location } : {}),
          ...(item.unit ? { satuan: item.unit } : {}),
          ...(item.description ? { deskripsi: item.description } : {}),
          ...(safePhoto ? { foto: safePhoto } : {}),
        }

    if (existingId) {
      payload.status_aktif = Boolean(item.available)
      await apiRequest(`/${room ? 'rooms' : 'logistic-items'}/${existingId}`, { method: 'PATCH', body: payload })
    } else {
      await apiRequest(`/${room ? 'rooms' : 'logistic-items'}`, { method: 'POST', body: payload })
    }

    if (room) setRooms(await apiListRooms('limit=100'))
    else setInventory(await apiListLogisticItems('limit=100'))
  }

  const deleteResource = async (kind, id) => {
    await apiRequest(`/${kind === 'room' ? 'rooms' : 'logistic-items'}/${id}`, { method: 'DELETE' })
    if (kind === 'room') setRooms(await apiListRooms('limit=100'))
    else setInventory(await apiListLogisticItems('limit=100'))
  }

  const submitDecision = async (id, keputusan, alasan) => {
    const result = await apiSubmitLogisticsDecision(id, {
      keputusan,
      alasan: alasan?.trim() || undefined,
    })
    await refreshRequests()
    return result
  }

  const issueSbp = async (id) => {
    const result = await apiIssueSbp(id)
    await refreshRequests()
    return result
  }

  const submitInspection = async (id, body) => {
    const result = await apiSubmitInspection(id, body)
    await refreshRequests()
    return result
  }

  const downloadSbp = async (id, nomorSbp) => {
    await apiDownloadSbpPdf(id, nomorSbp)
  }

  const context = {
    rooms,
    setRooms,
    inventory,
    setInventory,
    applications,
    profile,
    logout,
    saveResource,
    deleteResource,
    refreshRequests,
    submitDecision,
    issueSbp,
    submitInspection,
    downloadSbp,
    dataError,
    dataLoading,
  }

  return (
    <div className="app-shell app-shell--logistik">
      <header className="app-header dashboard-header logistik-header">
        <Brand to="/logistik" />
        <div className="dashboard-header__actions">
          <button aria-label="Keluar dari akun" className="dashboard-logout" onClick={() => setLogoutOpen(true)} title="Keluar" type="button">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <PageContainer className="logistik-main"><Outlet context={context} /></PageContainer>
      <nav aria-label="Navigasi Logistik" className="logistik-bottom-nav">
        {navItems.map(([to, label, Icon], index) => {
          const path = location.pathname
          const active = index === 0
            ? path === '/logistik'
            : index === 1
              ? path.startsWith('/logistik/data') || path.startsWith('/logistik/ruangan') || path.startsWith('/logistik/inventaris')
              : index === 2
                ? path.startsWith('/logistik/pengajuan') || path.startsWith('/logistik/dokumen')
                : index === 3
                  ? path.startsWith('/logistik/pemeriksaan') || path.startsWith('/logistik/pengembalian')
                  : path.startsWith('/logistik/profil')
          return (
            <Link
              aria-current={active ? 'page' : undefined}
              aria-label={index === 2 && pendingApplicationCount ? `${label}, ${pendingApplicationCount} belum ditindaklanjuti` : label}
              className={`logistik-bottom-nav__link${active ? ' is-active' : ''}`}
              key={to}
              to={to}
            >
              <span className="logistik-bottom-nav__icon">
                <Icon size={19} />
                {index === 2 && pendingApplicationCount > 0 && (
                  <span aria-hidden="true" className="logistik-nav-badge">{pendingApplicationCount > 99 ? '99+' : pendingApplicationCount}</span>
                )}
              </span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari akun?">
        <p className="modal-copy">Sesi Logistik Anda akan diakhiri.</p>
        <div className="modal-actions">
          <Button onClick={() => setLogoutOpen(false)} variant="secondary">Batal</Button>
          <Button onClick={logout}>Keluar</Button>
        </div>
      </Modal>
    </div>
  )
}

export default LogistikLayout
