
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { Login } from "./pages/Login";
import DashboardPeminjam from "./pages/DashboardPeminjam";
import DashboardLogistik from "./pages/DashboardLogistik";
import { Fsk } from "./pages/peminjam/steps/step-1-data";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman awal langsung diarahkan ke login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Halaman login */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* Form pengajuan peminjaman */}
        <Route
          path="/peminjam/fsk"
          element={<Fsk />}
        />

        {/* Dashboard peminjam */}
        <Route
          path="/dashboard/peminjam"
          element={
            <DashboardPeminjam email="email@university.ac.id" />
          }
        />

        {/* Dashboard logistik */}
        <Route
          path="/dashboard/logistik"
          element={
            <DashboardLogistik email="tim.logistik@university.ac.id" />
          }
        />

        {/* URL yang tidak terdaftar */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
