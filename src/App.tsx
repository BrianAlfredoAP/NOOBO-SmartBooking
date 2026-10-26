import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import DashboardPeminjam from "./pages/DashboardPeminjam";
import DashboardLogistik from "./pages/DashboardLogistik";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect ke login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Halaman login */}
        <Route path="/login" element={<Login />} />

        {/* Dashboard peminjam */}
        <Route
          path="/dashboard/peminjam"
          element={<DashboardPeminjam email="email@university.ac.id" />}
        />

        {/* Dashboard logistik */}
        <Route
          path="/dashboard/logistik"
          element={<DashboardLogistik email="tim.logistik@university.ac.id" />}
        />

        {/* Fallback — halaman tidak ditemukan, redirect ke login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
