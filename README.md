# NOOBO — Easy Book, Easy Use

Aplikasi web peminjaman ruangan kampus berbasis React. NOOBO menghubungkan **Peminjam** (mahasiswa/organisasi) dengan **Logistik Kampus** dalam satu platform yang ringan dan mobile-friendly.

---

## Tampilan

| Login | Dashboard Peminjam | Dashboard Logistik |
|---|---|---|
| Pilih peran, masuk ke akun | Lihat & ajukan peminjaman | Kelola pengajuan & stok barang |

---

## Fitur

### Halaman Login
- Tab switcher **Peminjam** / **Logistik Kampus**
- Input email & kata sandi dengan toggle show/hide
- Lupa kata sandi & kontak bantuan

### Dashboard Peminjam
- Greeting dengan nama dari email
- Tombol **Ajukan Peminjaman**
- Daftar **Peminjaman Terbaru** dengan status (Disetujui / Menunggu / Ditolak)
- Toggle "Lihat Semua" / "Tampilkan Lebih Sedikit"
- Bottom navigation: Beranda, Peminjaman, Dokumen, Riwayat, Profil

### Dashboard Logistik Kampus
- **Ringkasan Aktivitas** — grid 4 kartu (Pengajuan Baru, Peminjaman Aktif, Barang Dipinjam, Menunggu Pemeriksaan)
- **Pengajuan Terbaru** dengan status badge berwarna
- **Perlu Perhatian** — stok menipis, pengembalian hari ini, pemeriksaan terjadwal
- Badge angka pada tab Pengajuan di bottom navigation

---

## Tech Stack

| Kategori | Library / Tool |
|---|---|
| Framework | React 19 |
| Bahasa | TypeScript (TSX) |
| Bundler | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | CSS murni (Mobile-first) |
| Linter | oxlint |

---

## Struktur Proyek

```
noobo/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                          # Gambar & ilustrasi
│   │   ├── glossy-blue-graduation-emblem-2.png
│   │   ├── vector.png                   # Icon email
│   │   ├── vector-2.png                 # Icon eye (hide)
│   │   ├── vector-3.png                 # Icon eye (show)
│   │   ├── vector-4.png                 # Ilustrasi ruangan
│   │   └── image.png                    # Icon kunci
│   ├── pages/
│   │   ├── Login.tsx                    # Halaman login
│   │   ├── DashboardPeminjam.tsx        # Dashboard mahasiswa/peminjam
│   │   └── DashboardLogistik.tsx        # Dashboard logistik kampus
│   ├── web.app/
│   │   ├── Login.css                    # Style halaman login
│   │   ├── Dashboard.css                # Style dashboard peminjam
│   │   ├── DashboardLogistik.css        # Style dashboard logistik
│   │   └── Transition.css              # Animasi transisi
│   ├── App.tsx                          # Router utama
│   ├── main.tsx                         # Entry point
│   ├── index.css                        # Global style & scrollbar
│   └── vite-env.d.ts                    # Deklarasi tipe asset
├── index.html
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── .oxlintrc.json
```

---

## Routing

| Path | Halaman |
|---|---|
| `/` | Redirect → `/login` |
| `/login` | Halaman Login |
| `/dashboard/peminjam` | Dashboard Peminjam |
| `/dashboard/logistik` | Dashboard Logistik |
| `/*` | Redirect → `/login` |

---

## Memulai

### Prasyarat
- Node.js 18 ke atas
- npm 9 ke atas

### Instalasi

```bash
# Clone repositori
git clone <url-repo>
cd noobo

# Install dependencies
npm install
```

### Menjalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:5173](http://localhost:5173) di browser.

### Build Produksi

```bash
npm run build
```

Output tersimpan di folder `dist/`.

### Preview Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## Desain & Tampilan

- **Mobile-first** — dioptimalkan untuk layar 390–430px
- Tampilan desktop: frame 430px di tengah layar dengan background putih
- Gradasi biru (`#ffffff → #bce5fa → #87cef5`) sebagai latar halaman
- Panel konten putih dengan sudut melengkung (`border-radius: 32px`)
- Scrollbar tipis di pojok kanan layar (global via `index.css`)
- Font: **Plus Jakarta Sans** & **Poppins**

---

## Catatan Pengembangan

> Backend belum terhubung. Semua data saat ini menggunakan **dummy data** statis.
> Autentikasi, pengajuan peminjaman, dan manajemen data akan aktif setelah integrasi API.

---

## Lisensi

Proyek ini bersifat privat dan dikembangkan untuk keperluan internal kampus.
