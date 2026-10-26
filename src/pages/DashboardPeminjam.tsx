import { useState, type ReactNode } from "react";
import glossyBlueGraduationEmblem2 from "../assets/glossy-blue-graduation-emblem-2.png";
import vector4 from "../assets/vector-4.png";
// @ts-ignore CSS is loaded by the bundler; TypeScript has no declaration for this side-effect import.
import "../web.app/Dashboard.css";

type LoanStatus = "Disetujui" | "Menunggu" | "Ditolak";

type LoanItem = {
  id: number;
  ruang: string;
  acara: string;
  tanggal: string;
  peserta: number;
  status: LoanStatus;
};

type NavItem = {
  id: "beranda" | "peminjaman" | "dokumen" | "riwayat" | "profil";
  label: string;
  icon: (active: boolean) => ReactNode;
};

type DashboardPeminjamProps = {
  email?: string;
};

function nameFromEmail(email?: string) {
  if (!email) return "Pengguna";
  const local = email.split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ── Data dummy ── */
const allPeminjaman: LoanItem[] = [
  { id: 1, ruang: "Ruang Rapat A", acara: "Rapat Himpunan Informatika", tanggal: "12 Jun 2026", peserta: 30, status: "Disetujui" },
  { id: 2, ruang: "Ruang Rapat A", acara: "Rapat Himpunan Informatika", tanggal: "12 Jun 2026", peserta: 30, status: "Disetujui" },
  { id: 3, ruang: "Ruang Rapat A", acara: "Rapat Himpunan Informatika", tanggal: "12 Jun 2026", peserta: 30, status: "Disetujui" },
  { id: 4, ruang: "Ruang Seminar B", acara: "Seminar Teknologi Informasi", tanggal: "15 Jun 2026", peserta: 50, status: "Menunggu" },
  { id: 5, ruang: "Aula Utama", acara: "Pelantikan BEM Fakultas", tanggal: "20 Jun 2026", peserta: 120, status: "Ditolak" },
];

/* ── Nav config ── */
const navItems: NavItem[] = [
  {
    id: "beranda", label: "Beranda",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M3 10.5L12 3L21 10.5V20C21 20.6 20.6 21 20 21H15V15H9V21H4C3.4 21 3 20.6 3 20V10.5Z"
          fill={active ? "#057bf8" : "none"}
          stroke={active ? "#057bf8" : "#94a3b8"}
          strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    id: "peminjaman", label: "Peminjaman",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="20" rx="2"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M9 7H15M9 11H15M9 15H12"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "dokumen", label: "Dokumen",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M14 2V8H20" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 13H16M8 17H13" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "riwayat", label: "Riwayat",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M12 7V12L15 15" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "profil", label: "Profil",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M4 20C4 17 7.6 15 12 15C16.4 15 20 17 20 20"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/* ── Status badge ── */
function StatusBadge({ status }: { status: LoanStatus }) {
  const map: Record<LoanStatus, { bg: string; color: string; border: string }> = {
    Disetujui: { bg: "#e8faf2", color: "#1a9e5c", border: "#a7eacb" },
    Menunggu:  { bg: "#fff8e6", color: "#d4860a", border: "#ffe0a0" },
    Ditolak:   { bg: "#ffeaea", color: "#e53e3e", border: "#ffc0c0" },
  };
  const s = map[status];
  return (
    <span className="db-status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {status}
    </span>
  );
}

/* ── Icon helpers ── */
function CalIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="3" width="14" height="12" rx="2" stroke="#a0aec0" strokeWidth="1.4"/>
      <path d="M1 7H15" stroke="#a0aec0" strokeWidth="1.4"/>
      <path d="M5 1V4M11 1V4" stroke="#a0aec0" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
      <circle cx="5.5" cy="5" r="2.5" stroke="#a0aec0" strokeWidth="1.3"/>
      <path d="M1 13C1 10.8 3 9.5 5.5 9.5" stroke="#a0aec0" strokeWidth="1.3" strokeLinecap="round"/>
      <circle cx="10.5" cy="5" r="2.5" stroke="#a0aec0" strokeWidth="1.3"/>
      <path d="M15 13C15 10.8 13 9.5 10.5 9.5" stroke="#a0aec0" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}
function ChevronIcon() {
  return (
    <div className="db-loan-chevron">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke="#c8d8ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* ── Loan Card Mobile ── */
function LoanCardMobile({ item }: { item: LoanItem }) {
  return (
    <button className="db-loan-card">
      <div className="db-loan-thumb">
        <img src={vector4} alt={item.ruang} className="db-loan-thumb-img" />
      </div>
      <div className="db-loan-info">
        <p className="db-loan-title">{item.ruang}</p>
        <p className="db-loan-sub">{item.acara}</p>
        <div className="db-loan-meta">
          <span className="db-loan-meta-row"><CalIcon /><span>{item.tanggal}</span></span>
          <span className="db-loan-meta-row db-loan-meta-bottom">
            <span className="db-loan-meta-row"><PeopleIcon /><span>{item.peserta} peserta</span></span>
            <StatusBadge status={item.status} />
          </span>
        </div>
      </div>
      <ChevronIcon />
    </button>
  );
}

/* ── CTA Button (tampilan saja, tidak buka modal) ── */
function CtaButton() {
  return (
    <button className="db-cta-btn">
      <span className="db-cta-icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <circle cx="11" cy="11" r="11" fill="rgba(255,255,255,0.22)"/>
          <path d="M11 6V16M6 11H16" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
        </svg>
      </span>
      <span className="db-cta-label">Ajukan Peminjaman</span>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10H15M11 6L15 10L11 14" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}

/* MAIN COMPONENT*/
export default function DashboardPeminjam({ email }: DashboardPeminjamProps) {
  const [activeNav, setActiveNav] = useState<NavItem["id"]>("beranda");
  const [showAll, setShowAll] = useState(false);

  const userName   = nameFromEmail(email);
  const listToShow = showAll ? allPeminjaman : allPeminjaman.slice(0, 3);

  return (
    <div className="db-root">

      {/* ══ SIDEBAR (desktop only) ══ */}
      <aside className="db-sidebar">
        <div className="db-sidebar-logo">
          <span className="db-sidebar-logo-n">N</span>
          <img src={glossyBlueGraduationEmblem2} alt="" className="db-sidebar-logo-cap" />
          <span className="db-sidebar-logo-bo">BO</span>
        </div>
        <p className="db-sidebar-tagline">Easy Book, Easy Use</p>
        <nav className="db-sidebar-nav" aria-label="Navigasi utama">
          {navItems.map((nav) => {
            const active = activeNav === nav.id;
            return (
              <button
                key={nav.id}
                className={`db-sidebar-nav-item ${active ? "db-sidebar-nav-item--active" : ""}`}
                onClick={() => { setActiveNav(nav.id); setShowAll(false); }}
              >
                {nav.icon(active)}
                <span>{nav.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* ══ MAIN AREA ══ */}
      <div className="db-main">

        {/* Mobile header */}
        <header className="db-mobile-header db-mobile-only">
          <button className="db-notif-btn db-notif-absolute" aria-label="Notifikasi">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5.5 10C5.5 7 8.5 4.5 12 4.5C15.5 4.5 18.5 7 18.5 10V15.5L20.5 17.5H3.5L5.5 15.5V10Z"
                stroke="#4a90d9" strokeWidth="1.8" strokeLinejoin="round"/>
              <path d="M9.5 17.5C9.5 18.88 10.62 20 12 20C13.38 20 14.5 18.88 14.5 17.5"
                stroke="#4a90d9" strokeWidth="1.8"/>
            </svg>
          </button>

          <div className="db-greeting">
            <p className="db-greeting-halo">Halo,</p>
            <p className="db-greeting-name">{userName}</p>
            <p className="db-greeting-role">Peminjam</p>
          </div>

          <div className="db-mobile-hero-img">
            <img src={vector4} alt="" aria-hidden="true" />
          </div>
        </header>

        {/* Content */}
        <main className="db-content db-content-home">
          {/* CTA */}
          <CtaButton />

          {/* Section header */}
          <div className="db-section-header">
            <h2 className="db-section-title">Peminjaman Terbaru</h2>
            <button className="db-lihat-semua" onClick={() => setShowAll((v) => !v)}>
              {showAll ? "Lebih Sedikit" : "Lihat Semua"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 7H10M7.5 4.5L10 7L7.5 9.5" stroke="#057bf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Loan list */}
          <div className="db-loan-list">
            {listToShow.map((item) => (
              <LoanCardMobile key={item.id} item={item} />
            ))}
          </div>
        </main>

        {/* Mobile bottom nav */}
        <nav className="db-bottom-nav db-mobile-only" aria-label="Navigasi utama">
          {navItems.map((nav) => {
            const active = activeNav === nav.id;
            return (
              <button
                key={nav.id}
                className={`db-nav-item ${active ? "db-nav-item--active" : ""}`}
                onClick={() => { setActiveNav(nav.id); setShowAll(false); }}
              >
                {nav.icon(active)}
                <span className="db-nav-label">{nav.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
