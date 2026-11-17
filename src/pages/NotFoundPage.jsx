import { Link } from 'react-router'

function NotFoundPage() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>Halaman tidak ditemukan</h1>
      <p className="page-description">Alamat yang dibuka tidak tersedia.</p>
      <Link className="text-link" to="/auth">Kembali ke autentikasi</Link>
    </main>
  )
}

export default NotFoundPage
