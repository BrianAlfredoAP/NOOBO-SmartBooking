import { createBrowserRouter, Navigate } from 'react-router'
import LoginPage from '../pages/auth/LoginPage.jsx'
import PeminjamHomePage from '../pages/peminjam/PeminjamHomePage.jsx'
import FskPage from '../pages/peminjam/FskPage.jsx'
import RecommendationPage from '../pages/peminjam/RecommendationPage.jsx'
import FppPage from '../pages/peminjam/FppPage.jsx'
import PeminjamWorkspacePage from '../pages/peminjam/PeminjamWorkspacePage.jsx'
import DocumentsPage from '../pages/peminjam/DocumentsPage.jsx'
import PeminjamProfilePage from '../pages/peminjam/PeminjamProfilePage.jsx'
import ApplicationConfirmationPage from '../pages/peminjam/ApplicationConfirmationPage.jsx'
import ApplicationReceivedPage from '../pages/peminjam/ApplicationReceivedPage.jsx'
import PeminjamLayout from '../components/layout/PeminjamLayout.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/auth" replace /> },
  { path: '/auth', element: <LoginPage /> },
  {
    path: '/peminjam',
    element: <PeminjamLayout />,
    children: [
      { index: true, element: <PeminjamHomePage /> },
      { path: 'pengajuan', element: <PeminjamWorkspacePage section="pengajuan" /> },
      { path: 'pengajuan/:id', element: <PeminjamWorkspacePage section="detail" /> },
      { path: 'riwayat', element: <PeminjamWorkspacePage section="riwayat" /> },
      { path: 'profil', element: <PeminjamProfilePage section="profil" /> },
      { path: 'profil/notifikasi', element: <PeminjamProfilePage section="notifikasi" /> },
      { path: 'profil/bantuan', element: <PeminjamProfilePage section="bantuan" /> },
      { path: 'profil/tentang', element: <PeminjamProfilePage section="tentang" /> },
      { path: 'notifikasi', element: <PeminjamWorkspacePage section="notifikasi" /> },
      { path: 'notifikasi/:id', element: <PeminjamWorkspacePage section="notifikasi-detail" /> },
      { path: 'dokumen', element: <DocumentsPage /> },
      { path: 'dokumen/:id', element: <PeminjamWorkspacePage section="dokumen" /> },
      { path: 'ajukan', element: <FskPage /> },
      { path: 'ajukan/rekomendasi', element: <RecommendationPage /> },
      { path: 'ajukan/fpp', element: <FppPage /> },
      { path: 'ajukan/konfirmasi', element: <ApplicationConfirmationPage /> },
      { path: 'ajukan/diterima', element: <ApplicationReceivedPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
