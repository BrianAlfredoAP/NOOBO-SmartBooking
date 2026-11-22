# taste.md: Gaya Coding Backend SmartBooking Campus

Panduan gaya untuk backend (`backend/`) bagi tim dan AI agent. Bagian **A** diambil langsung dari kode yang sudah ada di branch `Backend-dev` (fitur Login). Bagian **B** adalah usulan tambahan untuk fitur yang belum ada. Kalau bentrok, **bagian A menang**: ikuti gaya yang sudah ada, jangan menulis ulang gaya kode lama.

---

## A. Gaya yang sudah ada di repo (wajib diikuti)

### A1. Tooling dan konfigurasi
- NestJS 12, TypeScript `strict`, **ESM** (`"type": "module"`, `module: nodenext`).
- **Import relatif selalu pakai ekstensi `.js`**: `import { AuthService } from './auth.service.js';`
- Import paket pihak ketiga yang tidak punya default export: `import * as bcrypt from 'bcrypt';`
- Prettier: `singleQuote: true`, `trailingComma: "all"`, indentasi 2 spasi, titik koma di akhir. Jalankan `npm run format` sebelum commit.
- Lint: **oxlint** (`npm run lint`). `no-floating-promises` = error, jadi setiap promise harus di-`await` atau di-`return`. `any` diperbolehkan, tapi hindari untuk data domain.
- Test: **Vitest** (`describe/it/expect/beforeEach` dari `vitest`), bukan Jest. E2E memakai Supertest: `import request from 'supertest'`.
- Validasi global di `main.ts`: `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. Test e2e harus memasang pipe yang sama.

### A2. Penamaan
- Domain dan database memakai **Bahasa Indonesia, snake_case**: tabel `pengajuan_peminjaman`, kolom `id_pengajuan`, `status_aktif`, `waktu_kirim`.
- Primary key: `id_<entitas>` (contoh `id_user`, `id_fsk`, `id_paket`), kecuali tabel `roles` (`id`).
- Boolean status aktif: `status_aktif`; status alur: `status` (string UPPER_SNAKE, contoh `MENUNGGU_PERSETUJUAN_PEMBINA`).
- Class: `PascalCase` (`PengajuanPeminjaman`, `AuthService`). File: `kebab/lowercase` dengan sufiks peran: `auth.service.ts`, `login.dto.ts`, `pengajuan-peminjaman.entity.ts`.
- Field hasil query yang dikirim ke klien memakai nama kolom apa adanya (`id_user`, `email`, `role`); jangan diubah ke camelCase di tengah jalan.

### A3. Struktur folder
```
src/
  <fitur>/                 # satu folder per modul: auth, users, ...
    <fitur>.module.ts
    <fitur>.controller.ts
    <fitur>.service.ts
    dto/<aksi>.dto.ts
    <fitur>.controller.spec.ts / <fitur>.service.spec.ts   # unit test di samping kode
  entities/{core,fsk,logistics,workflow}/<nama>.entity.ts  # kelas domain
test/<fitur>.e2e-spec.ts
database/schema.sql, seed.sql
```
Satu fitur = satu modul NestJS yang didaftarkan di `app.module.ts`.

### A4. Pola kode
- **Controller tipis**: hanya menerima DTO, memanggil service, membentuk respons. Logika bisnis ada di service.
- Respons sukses berbentuk `{ message: 'Login berhasil', ...data }` dengan pesan **Bahasa Indonesia**.
- `@HttpCode(HttpStatus.OK)` untuk POST yang bukan membuat resource; 201 untuk yang membuat.
- Service melempar exception bawaan Nest dengan **pesan Indonesia spesifik**: `UnauthorizedException('Email tidak terdaftar')`, `ForbiddenException('Akun tidak aktif')`.
- Data sensitif dibuang di service sebelum keluar: `const { password_hash, ...result } = user;`
- Konstruktor memakai parameter properti: `constructor(private usersService: UsersService) {}`.
- Method service `async` dan mengembalikan `Promise<...>`, termasuk saat datanya masih in-memory.
- Entity domain adalah **kelas dengan field private `_nama`** + getter publik bernama sama tanpa underscore + method perilaku (`submit()`, `updateStatus()`, `viewHistory()`). Mengikuti class diagram TUBES.

### A5. DTO dan validasi
- Satu DTO per aksi, memakai `class-validator`, dan **setiap dekorator diberi `message` Bahasa Indonesia**:
  ```ts
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;
  ```
- Jangan menerima field di luar DTO (sudah dijaga `forbidNonWhitelisted`).

### A6. Gaya test
- Nama test berbentuk kalimat Inggris `should ...` atau label skenario (`Positive Case: ...`, `Negative: ...`) sesuai matriks di `smartbooking_campus_tubes_specification_master_plan.md`.
- Cek **jenis exception dan pesannya**, bukan hanya status.
- Unit test membuat service langsung (`new UsersService()`); e2e memakai `Test.createTestingModule({ imports: [AppModule] })`.
- Setiap fitur baru minimal punya: 1 skenario positif, skenario negatif per alternative flow di SKPL, dan 1 skenario hak akses.

### A7. Database
- MySQL 8, `utf8mb4_unicode_ci`, `ENGINE=InnoDB`. Skema di `database/schema.sql`, data awal di `database/seed.sql`.
- Foreign key bernama `fk_<tabel>_<relasi>`. Gunakan `ON DELETE CASCADE` untuk anak yang tidak bermakna tanpa induk, `ON UPDATE CASCADE` untuk referensi master.
- Konfigurasi lewat `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `SESSION_SECRET`). Jangan commit `.env`; perbarui `.env.example` bila menambah variabel.

---

## B. Usulan tambahan untuk fitur berikutnya (belum ada di repo, sepakati dulu)

1. **Kode error stabil** selain pesan Indonesia: `throw new ConflictException({ code: 'RUANGAN_BENTROK', message: 'Ruangan sudah dipakai pada jadwal tersebut' })`. Berguna untuk tabel uji error (message + error code dalam JSON). Bila disetujui, buat satu exception filter global agar bentuk error seragam.
2. **Konstanta status** di satu file per domain (mis. `pengajuan.status.ts`) berupa `as const`, jangan menulis string status berulang di banyak tempat.
3. **Transisi status hanya lewat satu method** (`updateStatus` di entity/service) yang memeriksa transisi yang diizinkan.
4. **Guard peran**: `@Roles('Logistik Kampus')` + `RolesGuard` + `AuthGuard` (sesi/token dari tabel `sessions`). Pengecekan kepemilikan data (Peminjam hanya miliknya) dilakukan di service.
5. **Transaksi** untuk operasi yang mengubah lebih dari satu tabel (setujui pengajuan + alokasi + riwayat). Cek bentrok dilakukan di dalam transaksi yang sama.
6. **Akses data lewat satu lapisan** (repository/service data) sehingga service bisnis tidak menulis SQL langsung. Pilihan alat (Prisma sesuai SKPL, atau `mysql2`/TypeORM) diputuskan tim, lihat `tasks.md` T0-02.
7. **Tidak ada `console.log` untuk data sensitif** (password, token, email penuh) dan jangan pernah mengembalikan `password_hash` atau token mentah.
8. **Satu PR = satu use case**, diberi label UC/FR di judul: `feat(UC-06): validasi dan simpan FSK`. Pesan commit gaya `feat:`, `fix:`, `test:`, `docs:` seperti commit yang sudah ada.

---

## C. Yang jangan dilakukan
- Jangan mengubah gaya penamaan ke camelCase atau Inggris untuk entitas domain.
- Jangan menaruh logika bisnis di controller.
- Jangan menghapus `.js` pada import relatif.
- Jangan mengganti Vitest/oxlint dengan Jest/ESLint tanpa kesepakatan.
- Jangan menambah infrastruktur (cache, broker, microservice) tanpa kebutuhan jelas (sesuai `WORKFLOW.md`).
- Jangan commit `node_modules/`, `dist/`, `.env`, atau kredensial.
- Jangan menyatakan aksi berhasil sebelum hasil penyimpanannya terkonfirmasi (aturan SKPL di banyak alternative flow).

---

## D. Checklist sebelum membuka PR
- [ ] `npm run format` dan `npm run lint` bersih
- [ ] `npm test` dan `npm run test:e2e` lulus
- [ ] Skenario negatif SKPL untuk use case ini punya test
- [ ] Pesan error Bahasa Indonesia dan jelas
- [ ] Tidak ada field sensitif di respons
- [ ] `schema.sql`/`seed.sql`/`.env.example` diperbarui bila perlu
