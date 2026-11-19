import { useState } from 'react'
import { ClipboardCheck, ClipboardList, Database, House, LogOut, UserRound } from 'lucide-react'
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router'
import Brand from './Brand.jsx'
import PageContainer from './PageContainer.jsx'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import useLocalStorageState from '../../hooks/useLocalStorageState.js'
import { useAuth } from '../../context/auth-context.js'
import { demoLogistikUser, initialLogistikInventory, initialLogistikRooms } from '../../data/logistik-demo.js'
import { demoRecords } from '../../data/peminjam-workspace-demo.js'
import { isAwaitingLogistics } from '../../utils/logistik-workflow.js'

const navItems = [
  ['/logistik', 'Beranda', House],
  ['/logistik/data', 'Data', Database],
  ['/logistik/pengajuan', 'Pengajuan', ClipboardList],
  ['/logistik/pemeriksaan', 'Pemeriksaan', ClipboardCheck],
  ['/logistik/profil', 'Profil', UserRound],
]

function LogistikLayout() {
  const { user, endDemoSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [rooms, setRooms] = useLocalStorageState('noobo-logistik-rooms', initialLogistikRooms)
  const [inventory, setInventory] = useLocalStorageState('noobo-logistik-inventory', initialLogistikInventory)
  const [applications, setApplications] = useLocalStorageState('noobo-demo-applications', [])
  const [decisions, setDecisions] = useLocalStorageState('noobo-logistik-decisions', {})
  const [returnReports, setReturnReports] = useLocalStorageState('noobo-demo-return-reports', {})
  const [logoutOpen, setLogoutOpen] = useState(false)
  const requestsForBadge = [...new Map([...demoRecords, ...applications].map((request) => [request.id, request])).values()]
  const pendingApplicationCount = requestsForBadge.filter((request) => isAwaitingLogistics(request, decisions)).length
  if (!user || user.role !== 'logistik') return <Navigate to="/auth" replace />

  const profile = { ...demoLogistikUser, name: user.name, email: user.email }
  const logout = () => { setLogoutOpen(false); endDemoSession(); navigate('/auth', { replace: true }) }
  const context = { rooms, setRooms, inventory, setInventory, applications, setApplications, decisions, setDecisions, returnReports, setReturnReports, profile, sampleRequests: demoRecords, logout }

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
