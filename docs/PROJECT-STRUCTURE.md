# Struktur Project NOOBO

Repository ini mengelompokkan aplikasi dan aset pendukung secara terpisah.

- `frontend/`: aplikasi React 19 dengan Vite, Tailwind CSS 4, React Router, dan Lucide React. `src/` berisi halaman, komponen, context, data demo, hooks, routes, dan utils. `src/services/` disediakan untuk integrasi API di masa mendatang.
- `backend/`: aplikasi NestJS 12 dalam TypeScript. `src/auth/` dan `src/users/` adalah modul yang tersedia; `src/entities/` berisi definisi domain. `src/database/` menyediakan pool MySQL dan pemeriksaan koneksi saat startup. `src/config/` memvalidasi environment. Unit test berada bersama source dan E2E test berada di `test/`.
- `database/`: acuan SQL resmi project, yaitu `schema.sql` dan `seed.sql`.
- `docs/`: dokumentasi project termasuk notulensi dan dokumen struktur.
- `design-reference/`: lokasi referensi desain jika tersedia.
- `.gitignore`: aturan file lokal, dependency, build, cache, dan secret untuk seluruh monorepo.

Frontend dan backend merupakan aplikasi terpisah dengan `package.json` dan `package-lock.json` masing-masing. Backend membaca pengaturan MySQL dari `backend/.env`; contoh aman tersedia di `backend/.env.example`. Koneksi diperiksa saat startup dan pool ditutup melalui lifecycle shutdown NestJS. `UsersService` masih menggunakan array sementara dan belum memakai tabel database. Folder `database/` hanya menyimpan SQL; aplikasi tidak menjalankan schema atau seed otomatis.

