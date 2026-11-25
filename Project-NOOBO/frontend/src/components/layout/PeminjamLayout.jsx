import { useCallback, useEffect, useState } from 'react'
import { Navigate, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate } from 'react-router'
import { Bell, FileText, FolderOpen, History, Home, LogOut, UserRound } from 'lucide-react'
import Brand from './Brand.jsx'
import BottomNavigation from './BottomNavigation.jsx'
import PageContainer from './PageContainer.jsx'
import { initialFsk } from '../../data/peminjam-demo.js'
import { useAuth } from '../../context/auth-context.js'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import { demoUser } from '../../data/demo-user.js'
import { defaultNotificationPreferences } from '../../data/peminjam-workspace-demo.js'
import useLocalStorageState from '../../hooks/useLocalStorageState.js'
import {
  apiCancelLoanRequest,
  apiCreateFsk,
  apiCreateLoanRequest,
  apiGenerateRecommendations,
  apiGetLoanRequestDraft,
  apiGetProfile,
  apiListLogisticItems,
  apiListMyLoanRequests,
  apiListNotifications,
  apiListPembina,
  apiMarkAllNotificationsRead,
  apiMarkNotificationRead,
  apiSelectPackage,
  apiSubmitReturn,
  apiUpdateFsk,
  apiUpdateProfile,
  mapRecommendationPackage,
} from '../../api/client.js'

const navigationItems = [
  { to: '/peminjam', label: 'Beranda', icon: Home, end: true },
  { to: '/peminjam/pengajuan', label: 'Peminjaman', icon: FileText },
  { to: '/peminjam/dokumen', label: 'Dokumen', icon: FolderOpen },
  { to: '/peminjam/riwayat', label: 'Riwayat', icon: History },
  { to: '/peminjam/profil', label: 'Profil', icon: UserRound },
]

function initialsOf(name) {
  return (name || 'P').split(/\s+/).filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase() || 'P'
}

function PeminjamLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: sessionLoading, endDemoSession, startDemoSession } = useAuth()
  const [fsk, setFsk] = useState(() => ({ ...initialFsk, borrowerName: user?.name || initialFsk.borrowerName, whatsapp: user?.whatsapp || '' }))
  const [fskId, setFskId] = useState(null)
  const [fskStep, setFskStep] = useState(0)
  const [recommendations, setRecommendations] = useState(null)
  const [selectedRoom, setSelectedRoom] = useState('')
  const [selectedLogistics, setSelectedLogistics] = useState([])
  const [fppDraft, setFppDraft] = useState(null)
  const [selectedPembinaId, setSelectedPembinaId] = useState('')
  const [supervisorEmail, setSupervisorEmail] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [submittedApplications, setSubmittedApplications] = useState([])
  const [lastSubmittedRequest, setLastSubmittedRequest] = useState(null)
  const [equipmentCatalog, setEquipmentCatalog] = useState([])
  const [pembinaList, setPembinaList] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState('')
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [profile, setProfile] = useState(() => ({
    ...demoUser,
    name: user?.name || demoUser.name,
    initials: initialsOf(user?.name || demoUser.name),
    email: user?.email || demoUser.email,
    nim: '',
    programStudi: '',
    fakultas: '',
    whatsapp: user?.whatsapp || '',
    photo: '',
  }))
  const [notifications, setNotifications] = useState([])
  const [notificationPreferences, setNotificationPreferences] = useLocalStorageState('noobo-notification-preferences', defaultNotificationPreferences)

  const refreshData = useCallback(async () => {
    const [requests, notifs] = await Promise.all([
      apiListMyLoanRequests(100),
      apiListNotifications(),
    ])
    setSubmittedApplications(requests)
    setNotifications(notifs)
  }, [])

  const isPeminjamUser = user?.role === 'peminjam'
  const userEmail = user?.email
  const userName = user?.name

  useEffect(() => {
    if (!isPeminjamUser) return
    let active = true
    Promise.all([
      apiGetProfile(),
      apiListMyLoanRequests(100),
      apiListNotifications(),
      apiListLogisticItems('limit=100&status_aktif=true'),
      apiListPembina('limit=100&status_aktif=true'),
    ])
      .then(([apiProfile, requests, notifs, items, pembinas]) => {
        if (!active) return
        const nextProfile = {
          ...demoUser,
          id: apiProfile.id,
          name: apiProfile.nama || userName || demoUser.name,
          initials: initialsOf(apiProfile.nama || userName || demoUser.name),
          email: apiProfile.email || userEmail || demoUser.email,
          roleLabel: 'Mahasiswa · Peminjam',
          whatsapp: apiProfile.whatsapp || '',
          nim: '',
          programStudi: '',
          fakultas: '',
          photo: '',
        }
        setProfile(nextProfile)
        setFsk((current) => ({
          ...current,
          borrowerName: nextProfile.name,
          whatsapp: nextProfile.whatsapp || current.whatsapp,
        }))
        setSubmittedApplications(requests)
        setNotifications(notifs)
        setEquipmentCatalog([
          ...items.map((item) => ({
            id: item.id,
            label: item.name,
            unit: item.unit || 'unit',
            stock: item.stock,
            category: item.category,
          })),
          { id: 'lainnya', label: 'Lainnya', unit: '', stock: null },
        ])
        const activePembinas = pembinas.filter((item) => item.active)
        setPembinaList(activePembinas)
        setDataError('')
      })
      .catch((error) => {
        if (active) setDataError(error.message)
      })
      .finally(() => {
        if (active) setDataLoading(false)
      })
    return () => { active = false }
  }, [isPeminjamUser, userEmail, userName])

  const notificationPreferenceByCategory = {
    Pengajuan: 'applicationStatus',
    Persetujuan: 'applicationStatus',
    Dokumen: 'documents',
    Kegiatan: 'eventReminders',
    Pengembalian: 'returnReminders',
    'Informasi Kampus': 'campusInformation',
  }
  const unreadNotificationCount = notifications.filter(
    ({ read, category }) => !read && !notificationPreferences.doNotDisturb && notificationPreferences[notificationPreferenceByCategory[category] || 'applicationStatus'],
  ).length

  const updateProfile = async (updates) => {
    const updated = await apiUpdateProfile({
      nama: updates.name ?? profile.name,
      whatsapp: updates.whatsapp ?? profile.whatsapp,
    })
    const nextProfile = {
      ...profile,
      ...updates,
      name: updated.nama || profile.name,
      initials: initialsOf(updated.nama || profile.name),
      whatsapp: updated.whatsapp ?? '',
    }
    setProfile(nextProfile)
    startDemoSession({ id: updated.id, name: nextProfile.name, email: nextProfile.email, role: 'peminjam', whatsapp: nextProfile.whatsapp })
    setFsk((current) => ({ ...current, borrowerName: nextProfile.name, whatsapp: nextProfile.whatsapp }))
    return nextProfile
  }

  const generateRecommendations = async () => {
    const purposeParts = [fsk.purpose.trim()]
    if (fsk.organization?.trim()) purposeParts.push(`Organisasi: ${fsk.organization.trim()}`)
    if (fsk.specialNeeds?.trim()) purposeParts.push(`Catatan: ${fsk.specialNeeds.trim()}`)
    if (fsk.equipment.lainnya && fsk.otherEquipment?.trim()) purposeParts.push(`Kebutuhan lain: ${fsk.otherEquipment.trim()}`)

    const detail_kebutuhan = equipmentCatalog
      .filter(({ id }) => id !== 'lainnya' && Number(fsk.equipment[id]) > 0)
      .map(({ id, label }) => ({
        kategori: 'LOGISTIK',
        jenis_kebutuhan: label,
        jumlah: Number(fsk.equipment[id]),
      }))

    const payload = {
      nama_kegiatan: fsk.eventName.trim(),
      tanggal_mulai: fsk.date,
      tanggal_selesai: fsk.endDate || fsk.date,
      waktu_mulai: fsk.startTime,
      waktu_selesai: fsk.endTime,
      jumlah_peserta: Number(fsk.participants),
      tujuan_kegiatan: purposeParts.filter(Boolean).join('\n'),
      detail_kebutuhan,
    }

    const savedFsk = fskId
      ? await apiUpdateFsk(fskId, payload)
      : await apiCreateFsk(payload)
    const activeFskId = Number(savedFsk.id_fsk)
    setFskId(activeFskId)

    const packages = await apiGenerateRecommendations(activeFskId)
    const rooms = packages.map((pkg) => mapRecommendationPackage(pkg, fsk.participants))
    const firstLogistics = rooms[0]?.logistics || []
    setRecommendations({ fskId: activeFskId, rooms, logistics: firstLogistics })
    setSelectedRoom(rooms[0]?.id || '')
    setSelectedLogistics(firstLogistics.map((item) => item.id))
    navigate('/peminjam/ajukan/rekomendasi')
  }

  const selectPackage = async (packageId) => {
    const activeFskId = recommendations?.fskId || fskId
    if (!activeFskId || !packageId) throw new Error('Pilih satu paket rekomendasi terlebih dahulu.')
    await apiSelectPackage(activeFskId, packageId)
    const draft = await apiGetLoanRequestDraft(activeFskId)
    setFppDraft(draft)
    const chosen = recommendations?.rooms.find((room) => room.id === String(packageId))
    if (chosen) {
      setSelectedRoom(chosen.id)
      setSelectedLogistics((chosen.logistics || []).map((item) => item.id))
    }
    navigate('/peminjam/ajukan/fpp')
  }

  const choosePembina = (pembinaId) => {
    setSelectedPembinaId(String(pembinaId))
    const found = pembinaList.find((item) => String(item.id) === String(pembinaId))
    setSupervisorEmail(found?.email || '')
  }

  const submitApplication = async () => {
    const activeFskId = recommendations?.fskId || fskId
    const room = recommendations?.rooms.find((option) => option.id === selectedRoom)
    if (!activeFskId || !room) throw new Error('Paket rekomendasi tidak ditemukan.')
    if (!selectedPembinaId) throw new Error('Pilih Pembina terlebih dahulu.')

    const created = await apiCreateLoanRequest({
      id_fsk: activeFskId,
      id_pembina: Number(selectedPembinaId),
      setuju_syarat: Boolean(termsAccepted),
    })

    const summary = {
      id: String(created.id_pengajuan),
      nomor_pengajuan: created.nomor_pengajuan,
      status: created.status,
      email_status: created.email_status,
      event: {
        name: fsk.eventName,
        date: fsk.date,
        endDate: fsk.endDate || fsk.date,
        startTime: fsk.startTime,
        endTime: fsk.endTime,
      },
      room,
    }
    setLastSubmittedRequest(summary)
    setFskId(null)
    setRecommendations(null)
    setFppDraft(null)
    setSelectedRoom('')
    setSelectedLogistics([])
    setSelectedPembinaId('')
    setSupervisorEmail('')
    setTermsAccepted(false)
    setFskStep(0)
    setFsk({ ...initialFsk, borrowerName: profile.name, organization: profile.organization, whatsapp: profile.whatsapp })

    await refreshData().catch(() => {})
    navigate('/peminjam/ajukan/diterima')
    return summary
  }

  const cancelApplication = async (id, catatan) => {
    await apiCancelLoanRequest(id, catatan)
    await refreshData()
  }

  const submitReturnReport = async (id, payload) => {
    const result = await apiSubmitReturn(id, payload)
    await refreshData()
    return result
  }

  const markNotificationRead = async (notification) => {
    if (!notification.read && notification.rawId) {
      await apiMarkNotificationRead(notification.rawId).catch(() => {})
    }
    setNotifications((current) => current.map((item) => (item.id === notification.id ? { ...item, read: true } : item)))
  }

  const markAllNotificationsRead = async () => {
    await apiMarkAllNotificationsRead().catch(() => {})
    setNotifications((current) => current.map((item) => ({ ...item, read: true })))
  }

  const workflow = {
    fsk,
    setFsk: (updates) => setFsk((current) => ({ ...current, ...updates })),
    fskId,
    fskStep,
    setFskStep,
    equipmentCatalog,
    pembinaList,
    recommendations,
    selectedRoom,
    setSelectedRoom: (id) => {
      setSelectedRoom(id)
      const chosen = recommendations?.rooms.find((room) => room.id === id)
      if (chosen) setSelectedLogistics((chosen.logistics || []).map((item) => item.id))
    },
    selectedLogistics,
    setSelectedLogistics,
    fppDraft,
    selectedPembinaId,
    choosePembina,
    supervisorEmail,
    setSupervisorEmail,
    termsAccepted,
    setTermsAccepted,
    submittedApplications,
    lastSubmittedRequest,
    profile,
    setProfile: updateProfile,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    notificationPreferences,
    setNotificationPreferences,
    dataLoading,
    dataError,
    refreshData,
    logout: async () => { await endDemoSession(); navigate('/auth', { replace: true }) },
    generateRecommendations,
    selectPackage,
    clearRecommendations: () => {
      setRecommendations(null)
      setSelectedRoom('')
      setSelectedLogistics([])
      setFppDraft(null)
    },
    submitApplication,
    cancelApplication,
    submitReturnReport,
  }

  if (sessionLoading) return null
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
          <button aria-label="Keluar dari akun" className="dashboard-logout" onClick={() => setLogoutOpen(true)} title="Keluar" type="button">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>
      <PageContainer className="app-main"><Outlet context={workflow} /></PageContainer>
      <BottomNavigation label="Navigasi Peminjam" items={navigationItems} />
      <ScrollRestoration />
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari akun?">
        <p className="modal-copy">Sesi Anda akan diakhiri dan Anda kembali ke halaman Login.</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={() => setLogoutOpen(false)}>Batal</Button>
          <Button onClick={() => { setLogoutOpen(false); workflow.logout() }}>Keluar</Button>
        </div>
      </Modal>
    </div>
  )
}

export default PeminjamLayout
