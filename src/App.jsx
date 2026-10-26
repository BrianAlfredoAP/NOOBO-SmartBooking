import { Login } from "./pages/Login";
import DashboardPeminjam from "./pages/DashboardPeminjam";
import { Fsk } from "./pages/peminjam";

const PAGE = "peminjam"; // Change this value to "peminjam" or "dashboard" to test different pages

export default function App() {
  if (PAGE === "peminjam") {
    return <Fsk />;
  }

  if (PAGE === "dashboard") {
    return <DashboardPeminjam email="email@university.ac.id" />;
  }

  return <Login />;
}
