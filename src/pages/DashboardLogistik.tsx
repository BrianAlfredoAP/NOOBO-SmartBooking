import { useState, type ReactNode } from "react";
import glossyBlueGraduationEmblem2 from "../assets/glossy-blue-graduation-emblem-2.png";
import vector4 from "../assets/vector-5.png";
// @ts-ignore
import "../web.app/DashboardLogistik.css";

/* ════════════════════════════════════
   Types
   ════════════════════════════════════ */
type RequestStatus = "Menunggu Logistik" | "Disetujui" | "Ditolak" | "Diproses";

type RequestItem = {
  id: number;
  ruang: string;
  acara: string;
  tanggal: string;
  peserta: number;
  status: RequestStatus;
};

type AttentionItem = {
  id: number;
  title: string;
  sub: string;
  type: "warning" | "info";
  badge: string;
  badgeVariant: "red" | "orange" | "blue";
};

type NavId = "beranda" | "data" | "pengajuan" | "pemeriksaan" | "profil";

type NavItem = {
  id: NavId;
  label: string;
  badge?: number;
  icon: (active: boolean) => ReactNode;
};

type DashboardLogistikProps = {
  email?: string;
};

/* ════════════════════════════════════
   Helpers
   ════════════════════════════════════ */
function nameFromEmail(email?: string) {
  if (!email) return "Tim Logistik";
  const local = email.split("@")[0];
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ════════════════════════════════════
   Data dummy
   ════════════════════════════════════ */
const stats = [
  { id: 1, number: 5,  label: "Pengajuan Baru",        variant: "red",    icon: "📋" },
  { id: 2, number: 12, label: "Peminjaman Aktif",       variant: "blue",   icon: "🏢" },
  { id: 3, number: 28, label: "Barang Dipinjam",        variant: "green",  icon: "📦" },
  { id: 4, number: 3,  label: "Menunggu Pemeriksaan",   variant: "yellow", icon: "📝" },
];

const requests: RequestItem[] = [
  { id: 1, ruang: "Penggunaan Aula",    acara: "Seminar Teknologi 2026",         tanggal: "18 Jun 2026", peserta: 150, status: "Menunggu Logistik" },
  { id: 2, ruang: "Ruang Rapat B",      acara: "Rapat Koordinasi Jurusan",       tanggal: "19 Jun 2026", peserta: 25,  status: "Diproses" },
  { id: 3, ruang: "Laboratorium Kimia", acara: "Praktikum Kimia Organik",        tanggal: "20 Jun 2026", peserta: 40,  status: "Disetujui" },
];

const attentionItems: AttentionItem[] = [
  { id: 1, title: "Stok menipis",           sub: "Speaker (3 unit)",       type: "warning", badge: "Stok rendah",    badgeVariant: "red" },
  { id: 2, title: "Pengembalian hari ini",  sub: "Meja lipat (10 unit)",  type: "info",    badge: "Harus kembali",  badgeVariant: "orange" },
  { id: 3, title: "Pemeriksaan terjadwal",  sub: "AC Ruang Rapat A",      type: "info",    badge: "Segera",         badgeVariant: "blue" },
];

/* ════════════════════════════════════
   Nav items
   ════════════════════════════════════ */
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
    id: "data", label: "Data",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <ellipse cx="12" cy="5" rx="9" ry="3" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M3 5V12C3 13.66 7.03 15 12 15C16.97 15 21 13.66 21 12V5"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M3 12V19C3 20.66 7.03 22 12 22C16.97 22 21 20.66 21 19V12"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    id: "pengajuan", label: "Pengajuan", badge: 7,
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
    id: "pemeriksaan", label: "Pemeriksaan",
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8"/>
        <path d="M9 7H15M9 11H15M9 15H12"
          stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 7L9 8L11 6" stroke={active ? "#057bf8" : "#94a3b8"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
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

/* ════════════════════════════════════
   Sub-components
   ════════════════════════════════════ */

function StatusBadge({ status }: { status: RequestStatus }) {
  const map: Record<RequestStatus, string> = {
    "Menunggu Logistik": "dl-badge dl-badge--orange",
    "Diproses":          "dl-badge dl-badge--blue",
    "Disetujui":         "dl-badge dl-badge--green",
    "Ditolak":           "dl-badge dl-badge--red",
  };
  return <span className={map[status]}>{status}</span>;
}

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
    <div className="dl-chevron">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M6 4L10 8L6 12" stroke="#c8d8ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

/* Icon stat dengan warna berbeda */
function StatIcon({ variant }: { variant: string }) {
  const cls = `dl-stat-icon dl-stat-icon--${variant}`;
  if (variant === "red") return (
    <div className={cls}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 4C4 2.9 4.9 2 6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4Z"
          stroke="#e53e3e" strokeWidth="1.8" strokeLinejoin="round" fill="#fff0f0"/>
        <path d="M14 2V8H20" stroke="#e53e3e" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 13H16M8 17H13" stroke="#e53e3e" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
  if (variant === "blue") return (
    <div className={cls}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#057bf8" strokeWidth="1.8" fill="#edf4ff"/>
        <path d="M3 9H21M9 21V9" stroke="#057bf8" strokeWidth="1.8"/>
      </svg>
    </div>
  );
  if (variant === "green") return (
    <div className={cls}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
          stroke="#1a9e5c" strokeWidth="1.8" fill="#edfaf3"/>
      </svg>
    </div>
  );
  return (
    <div className={cls}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" rx="2" stroke="#d4860a" strokeWidth="1.8" fill="#fffbea"/>
        <path d="M9 7H15M9 11H15M9 15H13" stroke="#d4860a" strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

/* ════════════════════════════════════
   Main component
   ════════════════════════════════════ */
export default function DashboardLogistik({ email }: DashboardLogistikProps) {
  const [activeNav, setActiveNav] = useState<NavId>("beranda");
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllAttention, setShowAllAttention] = useState(false);
  const userName = nameFromEmail(email);

  const visibleRequests   = showAllRequests  ? requests       : requests.slice(0, 2);
  const visibleAttention  = showAllAttention ? attentionItems : attentionItems.slice(0, 2);

  return (
    <div className="dl-root">

      {/* ── Header ── */}
      <header className="dl-header">
        <button className="dl-notif-btn" aria-label="Notifikasi">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5.5 10C5.5 7 8.5 4.5 12 4.5C15.5 4.5 18.5 7 18.5 10V15.5L20.5 17.5H3.5L5.5 15.5V10Z"
              stroke="#4a90d9" strokeWidth="1.8" strokeLinejoin="round"/>
            <path d="M9.5 17.5C9.5 18.88 10.62 20 12 20C13.38 20 14.5 18.88 14.5 17.5"
              stroke="#4a90d9" strokeWidth="1.8"/>
          </svg>
          <span className="dl-notif-badge" aria-label="Ada notifikasi baru" />
        </button>

        <div className="dl-greeting">
          <p className="dl-greeting-halo">Halo,</p>
          <p className="dl-greeting-name">{userName}</p>
          <p className="dl-greeting-role">Logistik Kampus</p>
        </div>

        <div className="dl-hero-img">
          <img src={vector4} alt="" aria-hidden="true" />
        </div>
      </header>

      {/* ── Panel putih melengkung — wrapper nyata, bukan ::before ── */}
      <div className="dl-panel">
        <main className="dl-content">

          {/* Ringkasan Aktivitas */}
          <p className="dl-section-title">Ringkasan Aktivitas</p>
          <div className="dl-stats-grid">
            {stats.map((s) => (
              <div className="dl-stat-card" key={s.id}>
                <StatIcon variant={s.variant} />
                <div className="dl-stat-info">
                  <span className="dl-stat-number">{s.number}</span>
                  <span className="dl-stat-label">{s.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Pengajuan Terbaru */}
          <div className="dl-section-header">
            <p className="dl-section-title" style={{ margin: 0 }}>Pengajuan Terbaru</p>
            <button className="dl-lihat-semua" onClick={() => setShowAllRequests((v) => !v)}>
              {showAllRequests ? "Lebih Sedikit" : "Lihat Semua"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M4 7H10M7.5 4.5L10 7L7.5 9.5" stroke="#057bf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {visibleRequests.map((item) => (
            <button className="dl-request-card" key={item.id}>
              <div className="dl-request-thumb">
                <img src={vector4} alt={item.ruang} />
              </div>
              <div className="dl-request-info">
                <p className="dl-request-title">{item.ruang}</p>
                <p className="dl-request-sub">{item.acara}</p>
                <div className="dl-request-meta">
                  <span className="dl-request-meta-row"><CalIcon /><span>{item.tanggal}</span></span>
                  <span className="dl-request-meta-row"><PeopleIcon /><span>{item.peserta} peserta</span></span>
                </div>
                <div className="dl-request-footer">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <ChevronIcon />
            </button>
          ))}

          {/* Perlu Perhatian */}
          <div className="dl-section-header" style={{ marginTop: 24 }}>
            <p className="dl-section-title" style={{ margin: 0 }}>Perlu Perhatian</p>
            {attentionItems.length > 2 && (
              <button className="dl-lihat-semua" onClick={() => setShowAllAttention((v) => !v)}>
                {showAllAttention ? "Lebih Sedikit" : "Lihat Semua"}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M4 7H10M7.5 4.5L10 7L7.5 9.5" stroke="#057bf8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
          </div>
          <div className="dl-attention-list">
            {visibleAttention.map((item) => (
              <button className="dl-attention-card" key={item.id}>
                <div className={`dl-attention-icon${item.type === "info" ? " dl-attention-icon--yellow" : ""}`}>
                  {item.type === "warning" ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M12 9V13M12 17H12.01M10.29 3.86L1.82 18A2 2 0 003.54 21H20.46A2 2 0 0022.18 18L13.71 3.86A2 2 0 0010.29 3.86Z"
                        stroke="#e53e3e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="#d4860a" strokeWidth="1.8"/>
                      <path d="M12 8V12L15 15" stroke="#d4860a" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <div className="dl-attention-info">
                  <p className="dl-attention-title">{item.title}</p>
                  <p className="dl-attention-sub">{item.sub}</p>
                </div>
                <span className={`dl-badge dl-badge--${item.badgeVariant}`}>{item.badge}</span>
              </button>
            ))}
          </div>

          {attentionItems.length > 2 && (
            <div style={{ height: 8 }} />
          )}

        </main>
      </div>{/* end dl-panel */}

      {/* ── Bottom nav ── */}
      <nav className="dl-bottom-nav" aria-label="Navigasi utama">
        {navItems.map((nav) => {
          const active = activeNav === nav.id;
          return (
            <button
              key={nav.id}
              className={`dl-nav-item ${active ? "dl-nav-item--active" : ""}`}
              onClick={() => setActiveNav(nav.id)}
            >
              {nav.icon(active)}
              {nav.badge && <span className="dl-nav-badge">{nav.badge}</span>}
              <span className="dl-nav-label">{nav.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
