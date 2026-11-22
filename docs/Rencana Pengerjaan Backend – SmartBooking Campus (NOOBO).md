# Rencana Pengerjaan Backend — SmartBooking Campus (NOOBO)

> Sumber otoritatif: `docs/PRD & Development Plan Backend – SmartBooking Campus (NOOBO).md` (PRD revisi 02-A).
> Dipertimbangkan juga: `docs/README.md`, `docs/smartbooking_campus_tubes_specification_master_plan.md`, `docs/WORKFLOW.md`, dan existing code di `backend/src` + `database/`.

---

## 1. Keputusan Arsitektur (dari klarifikasi)

| Area | Keputusan | Alasan |
| --- | --- | --- |
| Akses data | **Raw SQL via `mysql2/promise` + query builder** | schema.sql eksisting dipertahankan sebagai sumber kebenaran; tidak ada Prisma/TypeORM |
| Multi-tenancy | **Single-campus sekarang** | schema.sql tanpa `campus_id`; multi-tenancy jadi backlog (hook: kolom `campus_id` ditambah belakangan via migrasi) |
| 22 entity class | **Dipertahankan sebagai domain layer** | Entity = objek domain berisi business logic, dihidrasi dari baris DB. Repository yang menjembatani SQL ↔ entity |
| ORM | Tidak ada | Repository pattern + mapper manual |

### Arsitektur target per modul

```
Controller (DTO, Guard, Swagger)
   ↓
Service (business logic, transaksi, orchestrasi)
   ↓
Repository (SQL via mysql2 pool, mapping row → Entity)
   ↓
Entity (domain object, method business logic nyata, bukan stub)
   ↓
mysql2 Pool → MySQL 8 (schema.sql + seed.sql)
```

- **DatabaseModule** (baru): provider `mysql2/promise.Pool` dari `@nestjs/config`, di-export global.
- **Repository**: `@Injectable()`, satu per area domain. Method jalankan SQL parameterized, map hasil → instance entity via `Entity.fromRow(row)` (factory statis ditambahkan ke tiap entity).
- **Entity**: constructor eksisting sudah terima field → tinggal tambah `static fromRow()` + implementasi method business logic nyata (ganti stub `return true`).
- **Transaksi & row lock** (NFR-09/10): `pool.getConnection()` → `beginTransaction()` → `SELECT ... FOR UPDATE` → `commit/rollback`. Bungkus dalam helper `runInTx(fn)`.

### Keputusan tambahan (hasil validasi)

- **bcrypt tetap di `AuthService`** (infrastruktur), bukan di entity. Entity hanya expose `getPasswordHash()`; hapus stub `User.login()`/`verifyPasswordHash()` yang salah semantik.
- **Role dinormalisasi ke enum uppercase**: `PEMINJAM`, `LOGISTIK` (nama di `roles` + JWT payload + `roles.guard`). `PEMBINA` & `ADMIN` tetap sebagai baris `roles` untuk future, tapi **Pembina tidak punya akun login** (token-only) — akun user Pembina dihapus dari `seed.sql`. `UsersRepository.findByEmail` wajib **JOIN `roles`** untuk dapat nama role.
- **Strategi testing**: unit test mock repository/pool (tanpa Docker, `npm test`); e2e (`npm run test:e2e`) tegen live MySQL via `docker compose up`.

---

## 2. Rekonsiliasi Schema: PRD vs schema.sql eksisting

User mempertahankan schema.sql. Tapi PRD butuh beberapa hal yang belum ada. Berikut **penambahan minimal** (bukan rewrite) ke `database/schema.sql`:

| # | Penambahan / perubahan | Penjelasan |
| --- | --- | --- |
| S1 | **Tabel baru `request_status_history`** | PRD §5: setiap transisi status harus dicatat (audit). Kolom: `id, id_pengajuan, from_status, to_status, actor_type, actor_id, note, at`. FK → pengajuan. |
| S2 | **Tabel baru `email_logs`** | PRD §6.9: log pengiriman email. Kolom: `id, id_pengajuan, to_email, template, status, error, sent_at`. |
| S3 | **Kolom `token_hash` + `alasan` di `token_keputusan`** | PRD §6.5 + NFR-03: hash token wajib disimpan (saat ini tabel hanya punya `id_token INT` misterius, **tidak ada `token_hash`** — kritis). `alasan` wajib untuk REJECT Pembina. |
| S4 | **Kolom `snapshot JSON` di `paket_rekomendasi`** | PRD §6.3: paket disimpan sebagai snapshot agar FPP/dokumen konsisten walau master berubah. |
| S5 | **Adopsi state machine status PRD** pada `pengajuan_peminjaman.status` | Nilai enum: `SUBMITTED, WAITING_PEMBINA, REJECTED_PEMBINA, WAITING_LOGISTIK, REJECTED_LOGISTIK, APPROVED_LOGISTIK, ONGOING, RETURN_REPORTED, COMPLETED, CANCELLED, EXPIRED`. Catatan: `DEFAULT` clause schema saat ini `'MENUNGGU_PERSETUJUAN_PEMBINA'` harus diubah ke `'SUBMITTED'`. |
| S6 | **Catatan cosmetic** | PK `token_keputusan.id_notifikasi` salah nama (seharusnya `id_token_keputusan`). Flag untuk rename di migrasi berikutnya, tidak blokir. |

**Yang sengaja TIDAK diadopsi sekarang** (sesuai keputusan):
- `campus_id` / tabel `Campus` (multi-tenancy defer)
- `RoomBooking`/`StockAllocation` terpisah → reuse `alokasi_ruangan` / `alokasi_logistik` eksisting untuk cek bentrok & stok.
- Soft delete `deleted_at` → gunakan `status_aktif` eksisting sebagai sinyal (catat divergensi dari PRD).

Pemetaan PRD entity → tabel eksisting:
- `ApprovalToken` = `token_keputusan` (+ S3)
- `ApprovalDecision` (Pembina) = direkam di `token_keputusan`; `ApprovalDecision` (Logistik) = `keputusan_logistik`
- `RoomBooking` = `alokasi_ruangan` | `StockAllocation` = `alokasi_logistik`
- `SbpgItem` = `detail_pengembalian`

---

## 3. Kondisi Eksisting (baseline)

Sudah berjalan:
- `POST /auth/login` — bcrypt, class-validator DTO, global `ValidationPipe`, e2e test 7 kasus (lulus).
- 22 entity class dengan stub method, di-unit-test.
- `UsersService` array in-memory (akan diganti repository + DB).

Belum ada (jadi pekerjaan Sprint 0):
- JWT/guard/refresh token, ConfigModule, Swagger, CORS, global exception filter, `.env`, docker-compose MySQL, koneksi DB nyata.

---

## 4. Rencana Eksekusi per Sprint

Mengikuti PRD §11 + WORKFLOW (vertical slice). Jalur kritis: **Sprint 0 → 1 → 2 → 3 → 4 → 5**. Setiap slice selesai end-to-end sebelum pindah.

### Sprint 0 — Fondasi & Infrastruktur (PRD Sprint 0)

Tujuan: aplikasi jalan dengan DB nyata, autentikasi JWT, Swagger, error format global, seed.

**a. Konfigurasi & environment**
- Install: `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `mysql2`, `@nestjs/swagger`, `helmet`, `@nestjs/throttler` (rate limit, opsional).
- Buat `.env` (dari `.env.example`): tambah `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `DB_HOST/PORT/USER/PASSWORD/NAME`, `PORT`, `NODE_ENV`, `APP_URL` (untuk email link).
- Wire `ConfigModule.forRoot({ isGlobal: true })` di `app.module.ts`.

**b. Database layer (baru)**
- `docker-compose.yml` (root repo): service `mysql` (MySQL 8, volume persistent, load `database/schema.sql` + `database/seed.sql` via `volumes: ./database:/docker-entrypoint-initdb.d`).
- `backend/src/database/database.module.ts` — provider `mysql2/promise.Pool` dari config.
- `backend/src/database/database.constants.ts` — token injection `DATABASE_POOL`.
- Update `database/schema.sql` dengan penambahan S1–S4 (lihat §2). Update `database/seed.sql` jika perlu kolom baru.
- Strategi migrasi: untuk sekarang schema.sql dieksekusi oleh docker init script (idempoten via `CREATE DATABASE IF NOT EXISTS` + `ON DUPLICATE KEY UPDATE` di seed). Backlog: folder `database/migrations/` bernomor + tabel `schema_migrations` jika perubahan inkremental.

**c. Repository pattern (baru) — contoh UsersRepository**
- `backend/src/users/users.repository.ts` — `findByEmail`, `findById`, `createUser` via SQL parameterized. Map row → `User.fromRow()`.
- Refactor `users.service.ts` → gunakan `UsersRepository` (hapus array in-memory & `seedDefaultUsers`).
- Tambah `User.fromRow(row)` factory ke `entities/core/user.entity.ts`.
- Pertahankan interface `UserRecord` sebagai tipe row/DTO, atau ganti dengan tipe row mysql2.

**d. Autentikasi JWT (upgrade)**
- `auth/auth.service.ts`: `login()` kembalikan `{ access_token, refresh_token, user }` (sign via `JwtService`). Tambah `validateToken`, `refresh`, `logout` (denylist refresh token di `sessions` tabel — reuse tabel `sessions` eksisting untuk simpan `token_hash` refresh).
- `auth/dto/`: tambah DTO response login (token), tidak hanya user.
- `auth/strategies/jwt.strategy.ts` — `passport-jwt`, ekstrak payload, validasi user aktif.
- `auth/guards/jwt-auth.guard.ts` + `auth/guards/roles.guard.ts` (peran `PEMINJAM`/`LOGISTIK`).
- `auth/decorators/roles.decorator.ts` (`@Roles('LOGISTIK')`).
- Endpoint: `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`, `POST /auth/refresh`.
- Update `test/auth.e2e-spec.ts`: assert `access_token` ada di response; pertahankan kasus negatif eksisting.

**e. Infra NestJS global**
- `main.ts`: `app.setGlobalPrefix('api/v1')`, `app.enableCors()` (origin dari config), `SwaggerModule` setup (`DocumentBuilder`, `/api/v1/docs`), `app.use(helmet())`, global `ValidationPipe` (sudah ada).
- `common/filters/all-exceptions.filter.ts` — global exception filter → format `{ statusCode, code, message, errors[] }`.
- `common/exceptions/business.exception.ts` — base exception bawa kode stabil (mis. `FSK_INVALID_CAPACITY`).
- `common/dto/pagination.dto.ts`, `common/dto/api-response.dto.ts` (wrapper respons konsisten).

**f. Seed diverifikasi**
- Login dengan akun dari `seed.sql` (hash bcrypt eksisting) → harus berhasil & dapat token.

**Verifikasi Sprint 0:**
- `docker compose up` → MySQL jalan, schema + seed ter-load.
- `npm run start:dev` → `POST /api/v1/auth/login` dengan `mahasiswa@campus.ac.id`/`password123` → 200 + `access_token`.
- `GET /api/v1/auth/me` dengan Bearer token → 200 profil.
- Swagger di `http://localhost:3000/api/v1/docs`.
- `npm test` + `npm run test:e2e` lulus.

**File kunci diubah/dibuat:**
- `backend/src/app.module.ts`, `backend/src/main.ts`
- `backend/src/database/database.module.ts`, `database.constants.ts`
- `backend/src/users/users.repository.ts`, `users.service.ts` (refactor), `users.module.ts`
- `backend/src/auth/auth.service.ts`, `auth.controller.ts`, `auth.module.ts`
- `backend/src/auth/strategies/jwt.strategy.ts`, `auth/guards/*.ts`, `auth/decorators/*.ts`, `auth/dto/*.ts`
- `backend/src/common/filters/*.ts`, `backend/src/common/exceptions/*.ts`, `backend/src/common/dto/*.ts`
- `backend/src/entities/core/user.entity.ts` (+`fromRow`), `session.entity.ts`
- `backend/.env`, `backend/.env.example` (update)
- `docker-compose.yml` (root)
- `database/schema.sql` (+S1–S4), `database/seed.sql`

---

### Sprint 1 — Master Data & Guard Peran (PRD FR-01..04, UC-01..05)

Tujuan: CRUD ruangan/logistik/pembina/aturan oleh Logistik, dengan guard peran & soft-delete via `status_aktif`.

- Modul baru: `rooms/`, `logistic-items/`, `pembina/`, `loan-rules/`. Tiap modul: `controller` + `dto` (create/update) + `service` + `repository` + entity wiring.
- Guard: semua POST/PATCH/DELETE pakai `@Roles('LOGISTIK')`; GET list bisa Peminjam & Logistik.
- Validasi: nama unik per resource, kapasitas/stok > 0, email Pembina valid & unik, kondisi valid.
- Hapus: soft-delete (`status_aktif = false`); tolak hard delete jika terkait pengajuan aktif (cek `alokasi_ruangan`/`alokasi_logistik` dengan `status_alokasi` aktif).
- Paginasi + filter pada GET list (NFR-05).
- Endpoint sesuai PRD §6.2 (`/rooms`, `/logistic-items`, `/pembina`, `/loan-rules`).
- Unit test repositori (mock pool) + e2e peran (Peminjam coba POST rooms → 403).
- Entity: implementasi `Ruangan.updateStatus()`, `Logistik.updateStok()` nyata (bukan stub).

**Verifikasi:** Logistik CRUD ruangan & logistik; Peminjam hanya GET; hapus terkait peminjaman aktif ditolak dengan kode error.

---

### Sprint 2 — FSK & Validasi (PRD FR-05,06, UC-06)

Tujuan: Peminjam simpan & ubah FSK valid.

- Modul `fsk/`: controller, dto (create/update), service, repository, `DetailKebutuhanFsk` handling.
- Endpoint: `POST /api/v1/fsk`, `PUT /api/v1/fsk/:id`.
- Validasi (PRD §6.3): kolom wajib, `jumlah_peserta > 0`, `tanggal_mulai ≤ tanggal_selesai`, tidak di masa lalu, `jumlah > 0` per item.
- Guard: hanya PEMINJAM milik sendiri (ownership check di service).
- Entity: `SpesifikasiKebutuhan.validate()` nyata; `DetailKebutuhanFsk.addDetail/updateDetail/deleteDetail` nyata via repo.

**Verifikasi:** FSK valid tersimpan; FSK tidak valid → kode error `FSK_INVALID_*`; Peminjam lain akses → 403/404.

---

### Sprint 3 — Rekomendasi & Pemilihan Paket (PRD FR-07..09, UC-07,08)

Tujuan: mesin rekomendasi rule-based < 10 detik + alasan + pilih paket dengan cek ulang ketersediaan.

- Modul `recommendations/`: `RecommendationService.generate(fsk)` dipisah (PRD §9).
- **Mesin rekomendasi Tahap 1** (rule-based, wajib):
  1. Filter keras: ruangan kapasitas ≥ peserta, tipe sesuai, kondisi baik, tidak bentrok periode (query `alokasi_ruangan` irisan waktu); barang stok tersedia ≥ jumlah (query `alokasi_logistik` irisan).
  2. Skor: kedekatan kapasitas, kecukupan stok, kondisi, kelengkapan.
  3. Bentuk ≤3 paket terbaik; simpan `paket_rekomendasi` + `paket_ruangan` + `paket_logistik` + `snapshot` JSON (S4) + `alasan` dari data nyata.
  4. Tidak ada hasil → `NO_PACKAGE_AVAILABLE`.
- **Query ketersediaan** (reuse, dipakai 3x: rekomendasi, pilih paket, approve Logistik): fungsi `checkRoomConflict(roomId, start, end)` & `availableStock(itemId, start, end)` di repository alokasi.
- Endpoint: `POST /api/v1/fsk/:id/recommendations`, `GET .../recommendations`, `POST /api/v1/fsk/:id/select-package` (cek ulang, `PACKAGE_UNAVAILABLE` bila berubah).
- Unit test: skor, filter bentrok, perhitungan stok, alasan hanya dari data.
- NFR-06: batasi kandidat, indeks `(id_ruangan, tanggal_mulai, tanggal_selesai)` di alokasi_ruangan (tambah ke schema.sql sebagai INDEX).

**Verifikasi:** rekomendasi < 10 detik dengan alasan factual; pilih paket cek ulang; stok bentrok saat pilih → kode error + alternatif.

---

### Sprint 4 — FPP & Persetujuan Pembina (PRD FR-10..14, UC-09..11)

Tujuan: pengajuan terkirim, email ke Pembina, keputusan sekali pakai via token.

- Modul `loan-requests/` (FPP) + `approvals/` (Pembina).
- Endpoint: `GET /api/v1/loan-requests/draft/:fskId`, `POST /api/v1/loan-requests`, `POST /api/v1/loan-requests/:id/cancel`; `GET /api/v1/approvals/:token`, `POST /api/v1/approvals/:token/decision`.
- **Token Pembina** (NFR-03): `crypto.randomBytes(32)` → simpan **hash** (`token_hash`) di `token_keputusan`, masa berlaku (env), sekali pakai (`waktu_digunakan`). Akses kedua → `APPROVAL_TOKEN_USED` + tampilkan keputusan lama (idempotent). Token kedaluwarsa → `EXPIRED`.
- **State machine**: implementasi transisi + tulis `request_status_history` (S1) dalam transaksi yang sama dengan perubahan data.
- **Email (outbox sederhana)**: tabel `email_logs` (S2). `EmailService.send()` simpan row outbox + kirim via Nodemailer; jika gagal → status `FAILED`, tersedia aksi kirim ulang. Jenis email sesuai PRD §6.9. Install `nodemailer`.
- Pembina dipilih dari daftar (dropdown) sesuai asumsi PRD §4 #3.
- Jika simpan pengajuan gagal → jangan kirim email. Jika email gagal → pengajuan tetap tersimpan, `email_logs.status=FAILED`.
- Entity: `PengajuanPeminjaman.submit()/updateStatus()` nyata; `TokenKeputusan.generateToken()/validateToken()/markAsUsed()` nyata via `crypto` + repo.

**Verifikasi:** alur FPP → email → Pembina approve/reject → status transisi tercatat di history; token dipakai 2x ditolak; email gagal → status FAILED + kirim ulang.

---

### Sprint 5 — Keputusan Logistik & SBP (PRD FR-15..19, UC-12..16)

Tujuan: alur sampai SBP terbit, bebas bentrok pada uji konkurensi.

- Modul `logistics/` (queue Logistik) + `sbp/` (dokumen).
- Endpoint: `GET /api/v1/logistics/loan-requests`, `GET .../:id`, `POST .../:id/decision`, `POST .../:id/sbp`, `GET /api/v1/logistics/ongoing-loans`.
- **Penguncian ketersediaan transaksional** (NFR-09/10): approve Logistik → `runInTx` → `SELECT ... FOR UPDATE` pada `alokasi_ruangan`/`alokasi_logistik` terkait → cek ulang → insert alokasi status terkunci → commit. Gagal → `ROOM_CONFLICT`/`STOCK_INSUFFICIENT`, rollback.
- **SBP**: `POST .../:id/sbp` → generate dokumen. Format PDF via `pdfmake` (install). Nomor unik, file path terkontrol, download oleh pemilik/Logistik. Tolak jika persetujuan Pembina+Logistik belum lengkap (`DOCUMENT_NOT_AVAILABLE`/`APPROVAL_INCOMPLETE`).
- Dashboard Peminjam: `GET /api/v1/me/loan-requests`, `GET .../:id`, `GET .../:id/sbp`. Ownership check (403/404 bila bukan miliknya).
- **Uji konkurensi**: 2 request approve ruangan sama bersamaan → hanya 1 sukses (test terisolasi).
- Entity: `KeputusanLogistik.approve()/reject()` nyata; `Sbp.generate()/save()/download()` nyata.

**Verifikasi:** alur approve Logistik → SBP terbit; uji konkurensi bentrok hanya 1 sukses; Peminjam lain akses SBP → 404/403.

---

### Sprint 6 — Pengembalian, Pemeriksaan & Riwayat (PRD FR-20..24, UC-17..19)

Tujuan: alur end-to-end sampai `COMPLETED`.

- Endpoint: `GET /api/v1/me/loan-requests/:id/return-form`, `POST .../sbpg`, `GET /api/v1/logistics/returns`, `GET .../returns/:id`, `POST .../returns/:id/inspection`, `POST .../returns/:id/complete`, `GET /api/v1/history`.
- **SBPG**: per item `returnedQty` (0..borrowedQty), `condition`, catatan. Catat `waktu_kirim`, `is_late` bila `> waktu_selesai_kegiatan + 1 jam` (FR-21, pakai `aturan_peminjaman.return_deadline` default 60 menit).
- **Pemeriksaan**: per item `OK/DAMAGED/LOST/INCOMPLETE`, selisih, catatan → `temuan_pemeriksaan` + `hasil_pemeriksaan`.
- **Penyesuaian stok saat complete** (transaksi): `OK` → kembalikan stok (update `alokasi_logistik.status` + logistik); `LOST` → kurangi `logistik.stok_total`; `DAMAGED` → ubah kondisi (stok tersedia berkurang sesuai kebijakan — konfirmasi manual via input inspection).
- **Riwayat** (FR-24): Peminjam hanya miliknya, Logistik semua. Dari `pengajuan_peminjaman` + `request_status_history` + dokumen.
- Entity: `Sbpg.generate()`; `DetailPengembalian.addDetail()/validate()`; `HasilPemeriksaan.inspect()/complete()`; `TemuanPemeriksaan.addTemuan()` nyata.

**Verifikasi:** alur RETURN_REPORTED → COMPLETED; stok terupdate sesuai hasil; riwayat terfilter per pemilik; `isLate` benar.

---

### Sprint 7 — Penguatan & Rilis (NFR-05,06,11, keamanan, deploy)

- Uji keamanan: akses lintas peran & lintas pemilik menyeluruh, token Pembina dipakai 2x/kedaluwarsa/salah, rate limit login.
- Optimasi indeks: `(id_ruangan, tanggal_mulai, tanggal_selesai)` alokasi_ruangan, `(id_logistik, tanggal_mulai, tanggal_selesai)` alokasi_logistik, `token_hash` unik, `(status)` pengajuan.
- Dokumentasi Swagger lengkap + error code reference.
- Nginx + HTTPS (produksi), backup MySQL berkala, panduan deploy (sesuai WORKFLOW §8).
- Audit README/docs vs implementasi (WORKFLOW §9).

---

## 5. Konvensi Lintas-Sprint

- **Error code stabil** (NFR-11): tiap alternative flow punya kode (`FSK_INVALID_CAPACITY`, `PACKAGE_UNAVAILABLE`, `APPROVAL_TOKEN_USED`, `ROOM_CONFLICT`, `STOCK_INSUFFICIENT`, `DOCUMENT_NOT_AVAILABLE`, `NO_PACKAGE_AVAILABLE`, `APPROVAL_INCOMPLETE`, dll). Daftar lengkap di `docs/error-codes.md` (buat saat Sprint 0/1).
- **Prefix endpoint**: `/api/v1`.
- **Respons sukses**: wrapper konsisten via `common/dto/api-response.dto.ts`.
- **Ownership & peran**: cek di service layer, uji per kasus.
- **Testing**: Vitest + supertest (sudah ada). Label tiap test dengan FR/NFR/UC (traceability PRD §10). Integration test pakai DB uji (container terpisah / transactional rollback).
- **Commit/PR**: branch `Backend-dev`, PR direview 1 anggota (PRD §11).
- **Migrasi schema**: penambahan S1–S4 + INDEX dimasukkan ke `database/schema.sql` (sumber tunggal). Jika nanti butuh migrasi inkremental, buat `database/migrations/NNN_*.sql` + runner backlog.

## 6. Risiko Spesifik Pendekatan Raw SQL

| Risiko | Mitigasi |
| --- | --- |
| SQL injection | Selalu parameterized query (`pool.execute(sql, [params])`), tidak pernah string concat untuk input user |
| Mapping row→entity boilerplate | `Entity.fromRow()` factory per entity; pertimbangkan mapper helper tipis |
| Transaksi manual error-prone | Helper `runInTx(fn)` terpusat di `database/`; unit test transaksi |
| Tidak ada tipe generated (seperti Prisma) | Definisikan tipe row/interface per tabel di `*/types.ts` (reuse `UserRecord` pattern) |
| Skema drift schema.sql vs DB | schema.sql = sumber kebenaran; docker init ulang untuk reset; backlog migrasi terversi |

## 7. Cara Memulai (langkah pertama)

Mulai dari **Sprint 0**. Kerjakan vertical slice fondasi: docker-compose MySQL → DatabaseModule → UsersRepository (ganti in-memory) → JWT auth → Swagger + exception filter → verifikasi login dengan akun seed. Selesaikan & uji sebelum Sprint 1.
