# PRD & Development Plan Backend – SmartBooking Campus (NOOBO)

Sumber: SKPL SmartBooking Campus revisi 02-A (12 Oktober 2026). Cakupan: backend saja (REST API, database, logika bisnis, integrasi email dan AI).

## 1. Ringkasan Produk

SmartBooking Campus adalah sistem peminjaman ruangan dan logistik kampus dengan rekomendasi paket berbasis AI. Backend bertanggung jawab atas seluruh aturan bisnis: autentikasi dan hak akses, pengelolaan data fasilitas, validasi FSK, rekomendasi paket, pengajuan FPP, persetujuan Pembina lewat tautan email, persetujuan Logistik Kampus, penerbitan SBP, pelaporan SBPG, pemeriksaan pengembalian, dan riwayat transaksi.

Alur utama: **FSK → rekomendasi AI → pilih paket → FPP → email ke Pembina → keputusan Pembina → keputusan Logistik → SBP → SBPG → pemeriksaan pengembalian → selesai.**

## 2. Tujuan dan Non-Goals

**Tujuan backend**

1. Menyediakan REST API (JSON) yang lengkap untuk 19 use case di SKPL.
2. Menjamin tidak ada bentrok jadwal ruangan dan stok tidak melebihi ketersediaan (NFR-09, NFR-10).
3. Menjalankan alur persetujuan berjenjang yang aman, termasuk tautan email Pembina yang sekali pakai (NFR-03).
4. Menghasilkan rekomendasi paket beserta alasan dalam maksimal 10 detik (NFR-06).
5. Menyimpan jejak lengkap setiap transaksi untuk riwayat dan audit (FR-24).
6. Mendukung banyak kampus tanpa data tercampur (SKPL 4.5, BG-06).

**Non-goals (di luar cakupan dokumen ini)**

- Implementasi frontend (React + Vite), desain UI, dan halaman Pembina.
- Akun atau dashboard Pembina (SKPL menyatakan Pembina tanpa akun).
- Aplikasi mobile native, pembayaran, dan integrasi SSO kampus.
- Pelatihan model machine learning khusus (lihat bagian 9).

## 3. Aktor dan Hak Akses

| Aktor | Autentikasi | Akses backend |
| --- | --- | --- |
| Peminjam | Login (JWT) | FSK, rekomendasi, pilih paket, FPP, status dan dokumen miliknya, SBPG, riwayat miliknya |
| Logistik Kampus | Login (JWT) | CRUD ruangan, logistik, Pembina, aturan; proses dan putuskan pengajuan; SBP; periksa pengembalian; pantau; semua riwayat |
| Pembina | Token tautan email (tanpa akun) | Lihat detail satu pengajuan dan memberi satu keputusan |

Semua pemeriksaan hak akses dilakukan di backend (SKPL 2.5 poin 5). Peminjam hanya boleh mengakses data miliknya (UC-16, UC-19).

## 4. Keputusan Teknis dan Poin yang Perlu Dikonfirmasi Tim

Beberapa hal di SKPL ambigu atau bertentangan. PRD ini mengambil asumsi berikut, silakan dikoreksi sebelum Sprint 1.

| # | Temuan di SKPL | Asumsi di PRD ini |
| --- | --- | --- |
| 1 | SKPL menyebut Express.js, sedangkan repo tim memakai NestJS + TypeScript | Backend memakai **NestJS** (TypeScript), arsitektur modul setara dengan yang dijelaskan SKPL. Jika dosen mewajibkan Express, struktur modul tetap bisa dipakai |
| 2 | Penomoran FR di bagian 2.2 berbeda dengan tabel di 3.1.1 | PRD memakai penomoran **3.1.1 (FR-01 sampai FR-24)** dan **NFR-01 sampai NFR-11** |
| 3 | Email Pembina: FR-04 menyimpan data Pembina, tetapi UC-09 meminta Peminjam mengetik email Pembina di FPP | Peminjam memilih Pembina dari daftar yang dikelola Logistik (dropdown). Alternatif: ketik email, lalu backend mencocokkan atau membuat entri Pembina berstatus belum terverifikasi |
| 4 | FR-18: sistem menerbitkan SBP, tetapi UC-15: Logistik yang menerbitkan | Logistik menekan aksi "Terbitkan SBP" setelah menyetujui, backend membuat dokumen. Bisa dibuat otomatis saat disetujui bila tim sepakat |
| 5 | Class Diagram dan ERD masih kosong di SKPL | Skema database diusulkan di bagian 7 |
| 6 | Teknologi AI belum ditetapkan | Mesin rekomendasi berbasis aturan dan skor, penjelasan alasan dari template; LLM opsional (bagian 9) |
| 7 | Multi-kampus tanpa mekanisme tenant | Semua tabel inti punya `campus_id`; user terikat satu kampus |
| 8 | Tidak ada status pembatalan atau kedaluwarsa | Ditambahkan status `CANCELLED` dan `EXPIRED` (tautan Pembina kedaluwarsa) |

**Stack yang diusulkan:** NestJS, TypeScript, MySQL 8, Prisma ORM (sesuai SKPL), JWT + bcrypt/argon2, class-validator, Nodemailer (SMTP), Swagger/OpenAPI, Jest + Supertest, Docker Compose untuk lingkungan lokal.

## 5. Alur Bisnis dan State Machine Pengajuan

### Status pengajuan (LoanRequest)

| Status | Arti | Transisi berikutnya |
| --- | --- | --- |
| `SUBMITTED` | FPP tersimpan, email dikirim | `WAITING_PEMBINA` |
| `WAITING_PEMBINA` | Menunggu keputusan Pembina | `APPROVED_PEMBINA`, `REJECTED_PEMBINA`, `EXPIRED` |
| `REJECTED_PEMBINA` | Ditolak Pembina, proses berhenti | akhir (Peminjam boleh mengajukan ulang) |
| `WAITING_LOGISTIK` | Disetujui Pembina, menunggu Logistik | `APPROVED_LOGISTIK`, `REJECTED_LOGISTIK` |
| `REJECTED_LOGISTIK` | Ditolak Logistik | akhir |
| `APPROVED_LOGISTIK` | Disetujui, ketersediaan terkunci, SBP belum terbit | `ONGOING` |
| `ONGOING` | SBP terbit, fasilitas dipinjam | `RETURN_REPORTED` |
| `RETURN_REPORTED` | SBPG dikirim Peminjam | `COMPLETED` |
| `COMPLETED` | Pemeriksaan selesai | akhir |
| `CANCELLED`, `EXPIRED` | Dibatalkan atau tautan kedaluwarsa | akhir |

Aturan: transisi hanya boleh sesuai tabel; setiap transisi ditulis ke `request_status_history` dalam satu transaksi database dengan perubahan datanya.

### Aturan ketersediaan

- Ruangan bentrok jika `start_baru < end_lama` dan `end_baru > start_lama` pada ruangan yang sama dengan reservasi berstatus aktif.
- Stok tersedia pada suatu periode = stok total dikurangi jumlah yang sudah dikunci oleh pengajuan aktif yang periodenya beririsan.
- Ketersediaan diperiksa **tiga kali**: saat rekomendasi (FR-07), saat paket dipilih (UC-08), dan saat Logistik menyetujui (FR-16). Pengecekan terakhir dan penguncian dilakukan dalam transaksi dengan row lock (`SELECT ... FOR UPDATE`) agar NFR-10 terpenuhi.
- Penghapusan ruangan atau barang yang masih terkait peminjaman aktif ditolak (UC-03, UC-04).
- SBPG dianggap terlambat jika `submitted_at > waktu_selesai_kegiatan + 1 jam` (FR-21).

## 6. Kebutuhan Fungsional Backend (Modul dan API)

Prefix semua endpoint: `/api/v1`. Respons sukses berformat JSON konsisten; respons error berformat `{ statusCode, code, message, errors[] }` dengan kode error yang stabil (misalnya `FSK_INVALID_CAPACITY`, `PACKAGE_UNAVAILABLE`, `APPROVAL_TOKEN_USED`) agar mudah diuji dan dipakai frontend (NFR-11).

### 6.1 Auth (FR-01, UC-01, UC-02, NFR-01, NFR-02)

| Method | Endpoint | Peran | Keterangan |
| --- | --- | --- | --- |
| POST | `/auth/login` | publik | Validasi kredensial, kembalikan access token (+ refresh token) dan peran |
| POST | `/auth/logout` | login | Cabut refresh token / masukkan token ke denylist |
| GET | `/auth/me` | login | Profil dan peran pengguna |
| POST | `/auth/refresh` | publik | Perbarui access token |

Catatan: kata sandi disimpan dengan hash (argon2 atau bcrypt), pesan error login tidak membedakan email salah atau sandi salah, ada rate limit pada login. Pembuatan akun (seed atau endpoint admin) perlu diputuskan karena SKPL tidak memuat registrasi.

### 6.2 Master Data oleh Logistik Kampus (FR-02, FR-03, FR-04, UC-03 sampai UC-05)

| Resource | Endpoint | Operasi | Validasi utama |
| --- | --- | --- | --- |
| Ruangan | `/rooms` | GET list/detail (Peminjam dan Logistik), POST/PATCH/DELETE (Logistik) | nama unik per kampus, kapasitas > 0, kondisi dan status ketersediaan valid |
| Logistik | `/logistic-items` | idem | stok ≥ 0, kondisi valid |
| Pembina | `/pembina` | CRUD (Logistik), GET list (Peminjam, untuk memilih) | format email, email unik per kampus |
| Aturan peminjaman | `/loan-rules` | GET, PUT (Logistik) | maks durasi, lead time pengajuan, teks syarat dan ketentuan, batas SBPG |

Penghapusan memakai soft delete bila sudah pernah dipakai transaksi, dan ditolak bila masih terkait peminjaman aktif.

### 6.3 FSK dan Rekomendasi (FR-05 sampai FR-09, UC-06 sampai UC-08)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| POST | `/fsk` | Simpan FSK: nama kegiatan, kapasitas peserta, tanggal mulai/selesai, waktu, kebutuhan ruangan, daftar barang dan jumlah. Validasi: kolom wajib, kapasitas > 0, tanggal mulai ≤ selesai, tidak di masa lalu, jumlah barang > 0 |
| PUT | `/fsk/:id` | Ubah FSK (kembali dari halaman rekomendasi); membatalkan rekomendasi lama |
| POST | `/fsk/:id/recommendations` | Jalankan mesin rekomendasi; kembalikan beberapa paket + alasan, atau daftar kosong dengan kode `NO_PACKAGE_AVAILABLE` |
| GET | `/fsk/:id/recommendations` | Ambil hasil rekomendasi terakhir |
| POST | `/fsk/:id/select-package` | Pilih satu paket; cek ulang ketersediaan; jika tidak lagi tersedia kembalikan `PACKAGE_UNAVAILABLE` beserta pilihan lain |

Paket disimpan sebagai *snapshot* (isi, skor, alasan) supaya FPP dan dokumen tetap konsisten walau data master berubah.

### 6.4 Pengajuan FPP (FR-10, FR-11, FR-12, UC-09)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/loan-requests/draft/:fskId` | Ringkasan FSK + paket terpilih + syarat dan ketentuan untuk halaman FPP |
| POST | `/loan-requests` | Kirim FPP: `fskId`, `pembinaId` (atau email), `acceptedTerms=true`. Menyimpan pengajuan + riwayat status, membuat token persetujuan, mengirim email ke Pembina |
| POST | `/loan-requests/:id/cancel` | Batalkan selama belum diputuskan Logistik |

Jika penyimpanan gagal, jangan mengirim email dan jangan mengklaim sukses. Jika email gagal, pengajuan tetap tersimpan, status email dicatat `FAILED`, dan tersedia aksi kirim ulang (UC-09 alternative flow).

### 6.5 Persetujuan Pembina via Tautan (FR-12, FR-13, FR-14, UC-10, UC-11, NFR-03)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/approvals/:token` | Detail pengajuan (kegiatan, jadwal, ruangan, barang) atau status keputusan jika sudah diputuskan |
| POST | `/approvals/:token/decision` | Body `{ decision: APPROVE\|REJECT, reason? }`; alasan wajib bila REJECT |

Keamanan tautan:

- Token acak kriptografis (minimal 32 byte), **hanya hash-nya yang disimpan**.
- Terikat ke satu pengajuan dan satu Pembina, punya masa berlaku, dan sekali pakai.
- Keputusan kedua pada token yang sama ditolak dengan `APPROVAL_TOKEN_USED` dan menampilkan keputusan sebelumnya (idempotent terhadap klik berulang).
- Respons tidak membuka data pengajuan lain.
- Setelah keputusan: simpan keputusan + waktu, ubah status, kirim email konfirmasi ke Pembina, dan jika ditolak kirim notifikasi ke Peminjam; jika disetujui, pengajuan muncul di antrean Logistik.

### 6.6 Proses Logistik Kampus (FR-15, FR-16, FR-17, FR-18, UC-12 sampai UC-15)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/logistics/loan-requests?status=WAITING_LOGISTIK` | Antrean pengajuan yang sudah disetujui Pembina, dengan filter dan paginasi |
| GET | `/logistics/loan-requests/:id` | Detail + hasil cek ketersediaan terkini |
| POST | `/logistics/loan-requests/:id/decision` | `APPROVE` atau `REJECT` (+ alasan). Approve menjalankan cek ulang dan penguncian ketersediaan dalam satu transaksi; gagal dengan `ROOM_CONFLICT` atau `STOCK_INSUFFICIENT` jika bentrok |
| POST | `/logistics/loan-requests/:id/sbp` | Terbitkan SBP; ditolak jika persetujuan Pembina dan Logistik belum lengkap |
| GET | `/logistics/ongoing-loans` | Peminjaman berlangsung (FR-17) |

SBP berisi nomor dokumen unik, identitas Peminjam, kegiatan, jadwal, ruangan, daftar barang dan jumlah, serta waktu penerbitan. Format dokumen: PDF dibuat di server (misalnya `pdfmake` atau Puppeteer), disimpan dengan path terkontrol, dan hanya bisa diunduh oleh pemiliknya atau Logistik.

### 6.7 Dashboard Peminjam (FR-19, UC-16, UC-19)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/me/loan-requests` | Daftar pengajuan milik sendiri + status |
| GET | `/me/loan-requests/:id` | Detail, riwayat status, dokumen yang tersedia |
| GET | `/me/loan-requests/:id/sbp` | Unduh SBP (404 `DOCUMENT_NOT_AVAILABLE` bila belum ada) |
| GET | `/me/loan-requests/:id/sbpg` | Unduh SBPG |
| GET | `/history` | Riwayat; Peminjam hanya miliknya, Logistik semua dalam kampusnya |

Akses pengajuan milik pengguna lain dikembalikan sebagai 403 atau 404 (UC-16, UC-19).

### 6.8 Pengembalian dan Pemeriksaan (FR-20 sampai FR-23, UC-17, UC-18)

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/me/loan-requests/:id/return-form` | Daftar barang dari SBP sebagai dasar SBPG |
| POST | `/me/loan-requests/:id/sbpg` | Kirim SBPG: per barang `returnedQty`, `condition`, catatan kerusakan/kehilangan. Validasi: `returnedQty` antara 0 dan jumlah dipinjam. Catat `submitted_at` dan tandai `isLate` bila > 1 jam setelah kegiatan selesai |
| GET | `/logistics/returns?status=PENDING_INSPECTION` | Daftar pengembalian yang perlu diperiksa |
| GET | `/logistics/returns/:id` | Tampilkan SBP, SBPG, dan barang berdampingan |
| POST | `/logistics/returns/:id/inspection` | Catat hasil per item: `OK`, `DAMAGED`, `LOST`, `INCOMPLETE`, selisih jumlah, catatan |
| POST | `/logistics/returns/:id/complete` | Selesaikan transaksi: stok dikembalikan sesuai hasil pemeriksaan, status `COMPLETED` |

Penyesuaian stok saat selesai: barang `OK` kembali ke stok; `DAMAGED` mengubah kondisi barang (stok tersedia berkurang sesuai kebijakan); `LOST` mengurangi stok total.

### 6.9 Notifikasi dan Email (FR-12, FR-14)

Layanan email berbasis antrean (BullMQ + Redis, atau tabel outbox sederhana untuk tahap awal) dengan retry dan log `email_logs`. Jenis email: permintaan persetujuan Pembina, konfirmasi keputusan Pembina, notifikasi penolakan ke Peminjam, notifikasi hasil keputusan Logistik, dan notifikasi SBP terbit.

## 7. Model Data (Usulan ERD)

Semua entitas inti memiliki `id`, `campus_id`, `created_at`, `updated_at`.

| Entitas | Atribut penting | Relasi |
| --- | --- | --- |
| `Campus` | name, code | punya banyak entitas lain |
| `User` | name, email (unik), password\_hash, role (`PEMINJAM`/`LOGISTIK`), is\_active | milik Campus |
| `Room` | name, type, capacity, condition, is\_available, deleted\_at | milik Campus |
| `LogisticItem` | name, category, total\_stock, condition, is\_available, deleted\_at | milik Campus |
| `Pembina` | name, email | milik Campus |
| `LoanRule` | max\_duration\_hours, min\_lead\_days, return\_deadline\_minutes (default 60), terms\_text | satu per Campus |
| `Fsk` | user\_id, activity\_name, participants, start\_at, end\_at, room\_type\_needed, status | punya banyak `FskItem` |
| `FskItem` | fsk\_id, item\_type/item\_id, quantity |  |
| `RecommendationPackage` | fsk\_id, rank, score, reason (JSON), snapshot (JSON) | punya banyak `PackageItem` |
| `PackageItem` | package\_id, room\_id atau item\_id, quantity |  |
| `LoanRequest` (FPP) | fsk\_id, package\_id, user\_id, pembina\_id, status, terms\_accepted\_at, submitted\_at | pusat transaksi |
| `RequestStatusHistory` | request\_id, from\_status, to\_status, actor\_type, actor\_id, note, at | audit alur |
| `ApprovalToken` | request\_id, pembina\_id, token\_hash, expires\_at, used\_at |  |
| `ApprovalDecision` | request\_id, decided\_by\_type (`PEMBINA`/`LOGISTIK`), decision, reason, decided\_at |  |
| `RoomBooking` | request\_id, room\_id, start\_at, end\_at, status | untuk cek bentrok |
| `StockAllocation` | request\_id, item\_id, quantity, start\_at, end\_at, status | untuk cek stok per periode |
| `Sbp` | request\_id (unik), doc\_number, file\_path, issued\_by, issued\_at |  |
| `Sbpg` | request\_id (unik), submitted\_at, is\_late, notes | punya banyak `SbpgItem` |
| `SbpgItem` | sbpg\_id, item\_id, borrowed\_qty, returned\_qty, reported\_condition, notes |  |
| `ReturnInspection` | sbpg\_id, inspected\_by, inspected\_at, result\_summary | punya banyak `InspectionItem` (condition, qty\_ok, qty\_damaged, qty\_lost, notes) |
| `EmailLog` | request\_id, to\_email, template, status, error, sent\_at |  |

Indeks wajib: `(room_id, start_at, end_at)` pada `RoomBooking`, `(item_id, start_at, end_at)` pada `StockAllocation`, `(campus_id, status)` pada `LoanRequest`, `token_hash` unik pada `ApprovalToken`.

## 8. Kebutuhan Non-Fungsional Backend

| NFR | Penerapan di backend |
| --- | --- |
| NFR-01 | Guard JWT + guard peran pada setiap controller; pengecekan kepemilikan data di service |
| NFR-02 | Hash kata sandi (argon2/bcrypt), tidak pernah mencatat atau mengembalikan hash |
| NFR-03 | Token Pembina acak, tersimpan sebagai hash, kedaluwarsa, sekali pakai |
| NFR-04 | Filter data per `campus_id` dan per pemilik; log tidak memuat data sensitif |
| NFR-05 | Paginasi, indeks DB, endpoint daftar dan master data responsif (target < 3 detik pada halaman) |
| NFR-06 | Rekomendasi < 10 detik: query ketersediaan efisien, batasi jumlah kandidat, timeout pada panggilan AI eksternal |
| NFR-08 | API tidak bergantung pada perangkat; CORS dikonfigurasi untuk domain frontend |
| NFR-09, NFR-10 | Transaksi database, row lock, unique constraint, aturan transisi status |
| NFR-11 | Exception filter global dengan kode error stabil dan pesan Bahasa Indonesia yang jelas |

Tambahan yang disarankan: HTTPS di produksi (Nginx), rate limiting, helmet, validasi DTO (whitelist), migrasi Prisma terversi, backup MySQL berkala, dan dokumentasi Swagger.

## 9. Desain Modul Rekomendasi AI

SKPL belum menetapkan teknologi AI. Usulan bertahap agar aman untuk jadwal tugas:

**Tahap 1 (wajib): mesin rekomendasi berbasis aturan dan skor, berjalan di backend.**

1. *Filter keras:* ruangan dengan kapasitas ≥ peserta, tipe sesuai, kondisi baik, tidak bentrok pada periode; barang dengan stok tersedia ≥ jumlah diminta pada periode itu.
2. *Skor kecocokan:* kedekatan kapasitas (tidak terlalu jauh lebih besar dari peserta), kecukupan stok, kondisi barang, dan kelengkapan seluruh kebutuhan.
3. *Pembentukan paket:* kombinasikan ruangan kandidat teratas dengan set barang; ambil 3 paket terbaik berurutan menurut skor.
4. *Penjelasan:* alasan disusun dari data nyata (misalnya "kapasitas 120 untuk 100 peserta", "stok proyektor 5, dibutuhkan 2"), sesuai SKPL 4.5.3 yang melarang alasan di luar data.
5. *Tidak ada hasil:* kembalikan daftar kosong dengan `NO_PACKAGE_AVAILABLE`; tidak boleh menampilkan fasilitas yang tidak memenuhi syarat.

**Tahap 2 (opsional): penyempurnaan dengan LLM.** Hanya untuk memperhalus teks alasan dari data yang sudah dihitung; ranking dan ketersediaan tetap ditentukan kode, bukan LLM. Dibungkus antarmuka `RecommendationExplainer` dengan fallback ke template jika timeout atau gagal (use case: komponen AI gangguan, UC-07). Kunci API hanya di variabel lingkungan backend.

Antarmuka internal: `RecommendationService.generate(fsk, campusId) → Package[]`, dipisah dari modul lain agar mudah diuji dan diganti.

## 10. Strategi Pengujian

- **Unit test:** validasi FSK, perhitungan bentrok jadwal dan stok, state machine status, skor rekomendasi, aturan keterlambatan SBPG.
- **Integration test (Supertest + MySQL uji):** alur lengkap dari login hingga COMPLETED, termasuk jalur penolakan Pembina dan Logistik.
- **Uji keamanan:** akses lintas peran dan lintas pemilik, token Pembina dipakai dua kali, token kedaluwarsa atau salah.
- **Uji konkurensi:** dua pengajuan menyetujui ruangan atau stok yang sama secara bersamaan; hanya satu yang berhasil.
- **Uji error:** setiap kegagalan di alternative flow SKPL punya kode error dan test.
- **Traceability:** setiap test diberi label FR/NFR/UC yang dicakup.

## 11. Rencana Pengembangan (Agile Scrum)

SKPL menetapkan Agile Scrum. Rencana di bawah memakai Sprint 2 minggu; durasi dan jumlah Sprint disesuaikan dengan tenggat TUBES. Estimasi dalam story point (SP) bersifat kasar untuk bahan Sprint Planning. Karena baru fitur Login yang berjalan di backend, rencana dimulai dari fondasi.

| Sprint | Sasaran | Isi utama (FR/UC) | Hasil yang bisa didemokan |
| --- | --- | --- | --- |
| 0 (persiapan) | Fondasi proyek | Struktur modul NestJS, Prisma + migrasi awal, Docker Compose MySQL, konfigurasi env, exception filter dan format error global, Swagger, CI lint + test, seed data (kampus, akun Peminjam dan Logistik) | Aplikasi jalan lokal, Swagger terbuka, `docker compose up` siap pakai |
| 1 | Autentikasi dan master data | FR-01 (UC-01, UC-02); FR-02, FR-03 (UC-03, UC-04); guard peran; paginasi dan filter | Login/logout, CRUD ruangan dan logistik dengan aturan hapus |
| 2 | Pembina, aturan, dan FSK | FR-04 (UC-05); FR-05, FR-06 (UC-06); validasi FSK lengkap | Logistik kelola Pembina dan aturan; Peminjam menyimpan FSK valid |
| 3 | Rekomendasi dan pemilihan paket | FR-07, FR-08, FR-09 (UC-07, UC-08); query ketersediaan; mesin skor; penjelasan; snapshot paket | Endpoint rekomendasi < 10 detik dengan alasan, pilih paket dengan cek ulang |
| 4 | FPP dan persetujuan Pembina | FR-10 sampai FR-14 (UC-09 sampai UC-11); outbox/antrean email; token persetujuan; state machine | Pengajuan terkirim, email ke Pembina, keputusan sekali pakai tercatat |
| 5 | Keputusan Logistik dan SBP | FR-15 sampai FR-19 (UC-12 sampai UC-16); penguncian ketersediaan transaksional; pembuat PDF SBP; dashboard Peminjam | Alur sampai SBP terbit, bebas bentrok pada uji konkurensi |
| 6 | Pengembalian dan riwayat | FR-20 sampai FR-24 (UC-17 sampai UC-19); SBPG; penanda terlambat; pemeriksaan; penyesuaian stok; riwayat | Alur end-to-end sampai `COMPLETED` |
| 7 | Penguatan dan rilis | Uji keamanan dan performa (NFR-05, NFR-06), perbaikan bug, optimasi indeks, dokumentasi API, konfigurasi Nginx + HTTPS, backup, panduan deploy | Build siap demo/produksi, laporan hasil uji |

Bila waktu sempit, jalur kritis yang harus selesai lebih dulu: Sprint 0 → 1 → 2 → 3 → 4 → 5. Sprint 6 dan sebagian Sprint 7 dapat dikerjakan paralel dengan frontend yang sudah berjalan.

### Pembagian kerja yang disarankan (5 anggota)

| Area | Cakupan |
| --- | --- |
| A. Platform | Sprint 0, auth, guard, error handling, CI, deploy |
| B. Master data | Ruangan, logistik, Pembina, aturan, riwayat |
| C. Rekomendasi | FSK, ketersediaan, mesin skor, penjelasan |
| D. Alur persetujuan | FPP, token Pembina, email, state machine, Logistik |
| E. Dokumen dan pengembalian | SBP/SBPG PDF, pemeriksaan, penyesuaian stok, uji end-to-end |

Setiap fitur dikerjakan dengan Pull Request ke branch `Backend-dev` dan ditinjau satu anggota lain sebelum merge.

## 12. Definition of Done

Sebuah item dianggap selesai jika: (1) endpoint sesuai kontrak di Swagger, (2) validasi dan seluruh alternative flow di SKPL punya kode error dan test, (3) pemeriksaan peran dan kepemilikan data diuji, (4) perubahan status tercatat di riwayat, (5) unit dan integration test lulus di CI, (6) migrasi Prisma ikut di-commit, dan (7) PR sudah direview.

## 13. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Bentrok jadwal/stok karena persetujuan bersamaan | Data tidak konsisten (NFR-10) | Transaksi + row lock, unique constraint, uji konkurensi sejak Sprint 3 |
| Email Pembina gagal terkirim atau masuk spam | Alur macet di `WAITING_PEMBINA` | Outbox + retry, log email, aksi kirim ulang, masa berlaku token yang wajar |
| Rekomendasi lambat | Melanggar NFR-06 | Filter keras di SQL, batasi kandidat, indeks tepat, timeout dan fallback pada LLM |
| Cakupan AI membengkak | Sprint 3 molor | Tahap 1 berbasis aturan dulu; LLM hanya opsional |
| Perbedaan stack SKPL (Express) vs repo (NestJS) | Penilaian tidak sesuai dokumen | Konfirmasi ke dosen atau revisi SKPL agar konsisten |
| Ambiguitas SKPL (email Pembina, penerbitan SBP) | Pengerjaan ulang | Putuskan di Sprint Planning 0 (lihat bagian 4) |
| Data master kampus tidak akurat | Rekomendasi salah | Validasi input ketat, seed data realistis untuk demo |

## 14. Pertanyaan Terbuka

1. Apakah akun Peminjam dibuat lewat registrasi, impor data kampus, atau seed oleh Logistik?
2. Apakah Pembina dipilih dari daftar atau diketik oleh Peminjam?
3. Apakah SBP terbit otomatis saat Logistik menyetujui atau lewat aksi terpisah?
4. Apa masa berlaku tautan Pembina dan bagaimana kebijakan pengajuan yang kedaluwarsa?
5. Bagaimana kebijakan stok untuk barang rusak atau hilang (potong stok otomatis atau konfirmasi manual)?
6. Apakah pembatalan oleh Peminjam diperbolehkan, dan sampai tahap mana?
