import { useEffect, useState } from 'react'
import { ClipboardCheck, ClipboardList, Database, House, LogOut, UserRound } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import Brand from './Brand.jsx'
import PageContainer from './PageContainer.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { useAuth } from '../../context/auth-context.js'
import { demoLogistikUser } from '../../data/logistik-demo.js'
import { isAwaitingLogistics } from '../../utils/logistik-workflow.js'
import { apiRequest, mapInventoryFromApi, mapRoomFromApi } from '../../api/client.js'

const navItems = [
  ['/logistik', 'Beranda', House],
  ['/logistik/data', 'Data', Database],
  ['/logistik/pengajuan', 'Pengajuan', ClipboardList],
  ['/logistik/pemeriksaan', 'Pemeriksaan', ClipboardCheck],
  ['/logistik/profil', 'Profil', UserRound],
]

function LogistikLayout() {
  const { user, endDemoSession, loading: sessionLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [rooms, setRooms] = useState([])
  const [inventory, setInventory] = useState([])
  const [applications] = useState([])
  const [decisions] = useState({})
  const [returnReports] = useState({})
  const [dataError, setDataError] = useState('')
  const [dataLoading, setDataLoading] = useState(true)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const requestsForBadge = applications
  const pendingApplicationCount = requestsForBadge.filter((request) => isAwaitingLogistics(request, decisions)).length
  useEffect(() => {
    if (!user || user.role !== 'logistik') return
    Promise.all([apiRequest('/rooms?limit=100'), apiRequest('/logistic-items?limit=100')])
      .then(([roomResponse, inventoryResponse]) => {
        setRooms((roomResponse.data || []).map(mapRoomFromApi))
        setInventory((inventoryResponse.data || []).map(mapInventoryFromApi))
        setDataError('')
      })
      .catch((error) => setDataError(error.message))
      .finally(() => setDataLoading(false))
  }, [user])
  if (sessionLoading) return null
  if (!user || user.role !== 'logistik') return <Navigate to="/auth" replace />

  const profile = { ...demoLogistikUser, name: user.name, email: user.email }
  const logout = async () => { setLogoutOpen(false); await endDemoSession(); navigate('/auth', { replace: true }) }
  const saveResource = async (kind, item, existingId) => {
    const room = kind === 'room'
    const payload = room
      ? { nama_ruangan: item.name, jenis: item.category || 'Ruangan', lokasi: item.building, kapasitas: item.capacity, kondisi_fasilitas: item.condition }
      : { nama_logistik: item.name, jenis: item.category, stok_total: item.stock, kondisi_fasilitas: item.condition }
    if (existingId) {
      payload.status_aktif = item.available
      await apiRequest(`/${room ? 'rooms' : 'logistic-items'}/${existingId}`, { method: 'PATCH', body: payload })
    } else {
      await apiRequest(`/${room ? 'rooms' : 'logistic-items'}`, { method: 'POST', body: payload })
    }
    const response = await apiRequest(`/${room ? 'rooms' : 'logistic-items'}?limit=100`)
    const next = (response.data || []).map(room ? mapRoomFromApi : mapInventoryFromApi)
    if (room) setRooms(next)
    else setInventory(next)
  }
  const deleteResource = async (kind, id) => {
    await apiRequest(`/${kind === 'room' ? 'rooms' : 'logistic-items'}/${id}`, { method: 'DELETE' })
    if (kind === 'room') setRooms((current) => current.filter((item) => item.id !== id))
    else setInventory((current) => current.filter((item) => item.id !== id))
  }
  const context = { rooms, setRooms, inventory, setInventory, applications, decisions, returnReports, profile, sampleRequests: [], logout, saveResource, deleteResource, dataError, dataLoading }

  return <div className="app-shell app-shell--logistik">
    <header className="app-header dashboard-header logistik-header">
      <Brand to="/logistik" />
      <div className="dashboard-header__actions">
        <button aria-label="Keluar dari akun demo" className="dashboard-logout" onClick={() => setLogoutOpen(true)} title="Keluar" type="button">
          <LogOut size={18} aria-hidden="true" />
        </button>
      </div>
    </header>
    <PageContainer className="logistik-main"><Outlet context={context}/></PageContainer>
    <nav aria-label="Navigasi Logistik" className="logistik-bottom-nav">{navItems.map(([to,label,Icon],index)=>{const path=location.pathname;const active=index===0?path==='/logistik':index===1?path.startsWith('/logistik/data')||path.startsWith('/logistik/ruangan')||path.startsWith('/logistik/inventaris'):index===2?path.startsWith('/logistik/pengajuan')||path.startsWith('/logistik/dokumen'):index===3?path.startsWith('/logistik/pemeriksaan')||path.startsWith('/logistik/pengembalian'):path.startsWith('/logistik/profil');return <Link aria-current={active?'page':undefined} aria-label={index===2&&pendingApplicationCount?`${label}, ${pendingApplicationCount} belum ditindaklanjuti`:label} className={`logistik-bottom-nav__link${active?' is-active':''}`} key={to} to={to}><span className="logistik-bottom-nav__icon"><Icon size={19}/>{index===2&&pendingApplicationCount>0&&<span aria-hidden="true" className="logistik-nav-badge">{pendingApplicationCount>99?'99+':pendingApplicationCount}</span>}</span><span>{label}</span></Link>})}</nav>
    <Modal open={logoutOpen} onClose={()=>setLogoutOpen(false)} title="Keluar dari akun demo?"><p className="modal-copy">Sesi demonstrasi Logistik akan diakhiri.</p><div className="modal-actions"><Button onClick={()=>setLogoutOpen(false)} variant="secondary">Batal</Button><Button onClick={logout}>Keluar</Button></div></Modal>
  </div>
}

export default LogistikLayout
