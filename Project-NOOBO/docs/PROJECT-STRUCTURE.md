# Struktur Project NOOBO

Repository root menyimpan panduan, notulensi, dan aturan Git. Folder `Project-NOOBO/` memuat aplikasi serta aset pendukung.

- `Project-NOOBO/frontend/`: aplikasi React 19 dengan Vite, Tailwind CSS 4, React Router, dan Lucide React. `src/` berisi halaman, komponen, context, data demo, hooks, routes, dan utils. `src/services/` disediakan untuk integrasi API di masa mendatang.
- `Project-NOOBO/backend/`: aplikasi NestJS 12 dalam TypeScript. Modul yang tersedia: `src/auth/`, `src/users/`, `src/rooms/`, `src/logistic-items/`, `src/pembina/`, dan `src/loan-rules/`; `src/entities/` berisi definisi domain dan `src/common/` berisi DTO, filter, serta exception bersama. `src/database/` menyediakan pool MySQL dan pemeriksaan koneksi saat startup. `src/config/` memvalidasi environment. Unit test berada bersama source dan E2E test berada di `test/`.
- `Project-NOOBO/database/`: acuan SQL resmi project, yaitu `schema.sql` dan `seed.sql`.
- `Project-NOOBO/docs/`: dokumentasi struktur project.
- `Project-NOOBO/design-reference/`: lokasi referensi desain jika tersedia.
- `README.md` dan `NOTULENSI.md`: panduan dan notulensi project di root.
- `.gitignore`: aturan file lokal, dependency, build, cache, dan secret untuk seluruh repository.

Frontend dan backend merupakan aplikasi terpisah dengan `package.json` dan `package-lock.json` masing-masing. Backend membaca pengaturan MySQL dan JWT dari `.env` di folder backend; contoh aman tersedia di `.env.example`. Koneksi diperiksa saat startup dan pool ditutup melalui lifecycle shutdown NestJS. Modul backend mengakses database melalui repository MySQL, bukan data sementara. Folder database hanya menyimpan SQL; aplikasi tidak menjalankan schema atau seed otomatis.

