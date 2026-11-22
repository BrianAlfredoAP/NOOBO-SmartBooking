import { useState } from 'react'
import { Navigate, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { Bell, FileText, FolderOpen, History, Home, LogOut, UserRound } from 'lucide-react'
import Brand from './Brand.jsx'
import BottomNavigation from './BottomNavigation.jsx'
import PageContainer from './PageContainer.jsx'
import { initialFsk } from '../../data/peminjam-demo.js'
import { buildRecommendations } from '../../utils/peminjam-workflow.js'
import { useAuth } from '../../context/auth-context.js'
import { createDemoApplication } from '../../data/application-demo.js'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { demoUser } from '../../data/demo-user.js'
import { defaultNotificationPreferences, initialDemoNotifications } from '../../data/peminjam-workspace-demo.js'
import useLocalStorageState from '../../hooks/useLocalStorageState.js'

const navigationItems = [
  { to: '/peminjam', label: 'Beranda', icon: Home, end: true },
  { to: '/peminjam/pengajuan', label: 'Peminjaman', icon: FileText },
  { to: '/peminjam/dokumen', label: 'Dokumen', icon: FolderOpen },
  { to: '/peminjam/riwayat', label: 'Riwayat', icon: History },
  { to: '/peminjam/profil', label: 'Profil', icon: UserRound },
]

function PeminjamLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, endDemoSession } = useAuth()
  const [fsk, setFsk] = useState(initialFsk)
  const [fskStep, setFskStep] = useState(0)
  const [recommendations, setRecommendations] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedLogistics, setSelectedLogistics] = useState([])
  const [supervisorEmail, setSupervisorEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submittedApplications, setSubmittedApplications] = useLocalStorageState('noobo-demo-applications', [])
  const [lastSubmittedRequestId, setLastSubmittedRequestId] = useState('')
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [profile, setProfile] = useState({ ...demoUser, nim:'', programStudi:'', fakultas:'', whatsapp:'', photo:'' })
  const [notifications, setNotifications] = useLocalStorageState('noobo-demo-notifications', initialDemoNotifications)
  const [notificationPreferences, setNotificationPreferences] = useLocalStorageState('noobo-notification-preferences', defaultNotificationPreferences)
  const [returnReports, setReturnReports] = useLocalStorageState('noobo-demo-return-reports', {})
  const [logisticsDecisions] = useLocalStorageState('noobo-logistik-decisions', {})
  const notificationPreferenceByCategory = { Pengajuan:'applicationStatus', Persetujuan:'applicationStatus', Dokumen:'documents', Kegiatan:'eventReminders', Pengembalian:'returnReminders', 'Informasi Kampus':'campusInformation' }
  const unreadNotificationCount = notifications.filter(({ read, category }) => !read && !notificationPreferences.doNotDisturb && notificationPreferences[notificationPreferenceByCategory[category] || 'applicationStatus']).length
  const updateProfile = (nextProfile) => {
    setProfile(nextProfile)
    setFsk((current) => ({ ...current, borrowerName: nextProfile.name, organization: nextProfile.organization, whatsapp: nextProfile.whatsapp }))
  }
  const submitApplication = () => {
    const room = recommendations?.rooms.find((option) => option.id === selectedRoom)
    if (!room) return false

    const application = createDemoApplication({
      sequence: submittedApplications.length + 1,
      fsk,
      room,
      logistics: recommendations.logistics.filter(({ id }) => selectedLogistics.includes(id)),
      supervisorEmail,
    })

    setSubmittedApplications((current) => [application, ...current])
    if (notificationPreferences.applicationStatus) setNotifications((current) => [{ id: `n-${application.id}`, title: 'Pengajuan diterima sistem simulasi', body: `${application.event.name} menunggu proses persetujuan.`, date: 'Baru', category: 'Pengajuan', requestId: application.id, read: false }, ...current])
    setLastSubmittedRequestId(application.id)
    navigate('/peminjam/ajukan/diterima')
    return true
  }

  const workflow = {
    fsk,
    setFsk: (updates) => setFsk((current) => ({ ...current, ...updates })),
    fskStep,
    setFskStep,
    recommendations,
    selectedRoom,
    setSelectedRoom,
    selectedLogistics,
    setSelectedLogistics,
    supervisorEmail,
    setSupervisorEmail,
    termsAccepted,
    setTermsAccepted,
    submittedApplications,
    lastSubmittedRequestId,
    profile,
    setProfile: updateProfile,
    notifications,
    setNotifications,
    notificationPreferences,
    setNotificationPreferences,
    returnReports,
    setReturnReports,
    logisticsDecisions,
    logout: () => { endDemoSession(); navigate('/auth', { replace: true }) },
    generateRecommendations: () => {
      const result = buildRecommendations(fsk)
      setRecommendations(result)
      setSelectedRoom('')
      setSelectedLogistics(result.logistics.map(({ id }) => id))
      navigate('/peminjam/ajukan/rekomendasi')
    },
    clearRecommendations: () => {
      setRecommendations(null)
      setSelectedRoom('')
      setSelectedLogistics([])
    },
    submitApplication,
  }

  const logout = () => setLogoutOpen(true)

  if (!user || user.role !== 'peminjam') return <Navigate to="/auth" replace />

  return (
    <div className="app-shell app-shell--peminjam">
      <header className="app-header dashboard-header">
        <Brand to="/peminjam" />
        <div className="dashboard-header__actions">
          <NavLink aria-label="Lihat notifikasi pengajuan" className="dashboard-notification" state={{ from: location.pathname }} to="/peminjam/notifikasi">
            <Bell size={20} aria-hidden="true" />
            <span className="dashboard-notification__count">{unreadNotificationCount}</span>
          </NavLink>
          <button aria-label="Keluar dari akun demo" className="dashboard-logout" onClick={logout} title="Keluar" type="button">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <PageContainer className="app-main"><Outlet context={workflow} /></PageContainer>
      <BottomNavigation label="Navigasi Peminjam" items={navigationItems} />
      <ScrollRestoration />
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari akun demo?">
        <p className="modal-copy">Sesi simulasi akan diakhiri dan Anda kembali ke halaman Login.</p>
        <div className="modal-actions"><Button variant="secondary" onClick={() => setLogoutOpen(false)}>Batal</Button><Button onClick={() => { setLogoutOpen(false); workflow.logout() }}>Keluar</Button></div>
      </Modal>
    </div>
  )
}

export default PeminjamLayout
