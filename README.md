# NOOBO SmartBooking

NOOBO adalah aplikasi Smart Booking Tel-U untuk mendukung peminjaman ruangan dan logistik kampus. Repository ini mengelompokkan frontend, backend, acuan database, dokumentasi, dan referensi desain dalam satu monorepo.

## Teknologi

- **Frontend:** React 19, Vite 8, JavaScript JSX, Tailwind CSS 4, React Router, Lucide React.
- **Backend:** NestJS 12, TypeScript, REST API, Vitest, Supertest.
- **Database:** MySQL Server 8.4.11, schema `smartbooking_db`; backend memakai `mysql2` connection pool.

## Struktur Monorepo

```text
frontend/          Aplikasi React dan konfigurasi Vite
backend/           Aplikasi NestJS, konfigurasi, dan pengujian
database/          schema.sql dan seed.sql sebagai acuan resmi
docs/              Dokumentasi dan notulensi
design-reference/  Referensi desain jika tersedia
```

Frontend dan backend merupakan aplikasi terpisah dengan dependency dan lockfile masing-masing. Frontend belum dihubungkan ke REST API. Backend membuka koneksi MySQL saat proses NestJS dimulai; `UsersService` masih memakai data sementara dalam memory dan belum membaca tabel `users`.

## Persiapan Database

Database lokal harus tersedia dengan nama `smartbooking_db` di MySQL `127.0.0.1:3306`. File `database/schema.sql` dan `database/seed.sql` adalah acuan resmi, dan tidak dijalankan otomatis oleh aplikasi.

Untuk menyiapkan database anggota tim melalui MySQL Workbench:

1. Buat/pilih schema `smartbooking_db`.
2. Buka dan jalankan `database/schema.sql`.
3. Buka dan jalankan `database/seed.sql` setelah schema berhasil dibuat.
4. Isi kredensial koneksi lokal di `backend/.env`.

Periksa isi seed sebelum menjalankannya pada database yang sudah berisi data. Backend tidak menjalankan migrasi, `DROP`, seed, atau pembuatan tabel otomatis.

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Validasi frontend:

```bash
cd frontend
npm run build
npm run lint
```

`frontend/.env.example` hanya berisi pengaturan client Vite, tanpa secret.

## Menjalankan Backend dan MySQL

```bash
cd backend
npm install
```

Salin `backend/.env.example` menjadi `backend/.env`, lalu isi `DB_PASSWORD` secara manual dengan password MySQL lokal. Nilai contoh lainnya adalah `PORT=3000`, `NODE_ENV=development`, `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_USER=root`, dan `DB_NAME=smartbooking_db`. File `.env` diabaikan Git.

Jalankan backend:

```bash
cd backend
npm run start:dev
```

Saat startup, backend memeriksa koneksi ke MySQL dan gagal dengan pesan konfigurasi yang jelas jika koneksi tidak tersedia. Pool ditutup pada graceful shutdown.

Validasi backend:

```bash
cd backend
npm run build
npm test
npm run test:e2e
npm run lint
```

Unit test tidak memerlukan koneksi database. E2E test yang memuat `AppModule` memerlukan MySQL lokal yang dapat diakses.

## Dokumentasi

- [Struktur project](docs/PROJECT-STRUCTURE.md)
- [Notulensi](docs/NOTULENSI.md)
