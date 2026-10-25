import { Login } from "./pages/Login";
import DashboardPeminjam from "./pages/DashboardPeminjam";

// Ganti nilai PAGE untuk preview tampilan yang diinginkan:
// "login"     → halaman login
// "dashboard" → dashboard peminjam
const PAGE = "login";

export default function App() {
  if (PAGE === "dashboard") {
    return <DashboardPeminjam email="email@university.ac.id" />;
  }
  return <Login />;
}
