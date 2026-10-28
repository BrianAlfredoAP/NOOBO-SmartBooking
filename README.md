# NOOBO-SmartBooking

**Sistem Peminjaman Ruangan dan Logistik Kampus Berbasis Web dengan Rekomendasi AI.**

Sistem ini mempermudah proses pengajuan peminjaman ruangan dan logistik di lingkungan kampus, dilengkapi alur persetujuan pembina, pengelolaan logistik, penerbitan SBP/SBPG, serta pemeriksaan fasilitas pasca kegiatan.

---

## Arsitektur & Teknologi

Sesuai dengan `WORKFLOW.md` dan `smartbooking_campus_tubes_specification_master_plan.md`:
* **Backend:** NestJS + TypeScript (REST API & OOP Domain Layer)
* **Frontend:** Vite (IMK / User Interface implementation)
* **Database:** MySQL
* **Testing:** Vitest + Supertest

---

## Struktur Backend (`backend/`)

```text
backend/
├── src/
│   ├── auth/                      # Fitur Autentikasi (Login End-to-End)
│   │   ├── dto/login.dto.ts       # Validasi Input Email & Password (Min. 6 Karakter)
│   │   ├── auth.service.ts        # Validasi Kredensial, Status Akun & Keamanan Password
│   │   ├── auth.controller.ts     # Endpoint POST /auth/login
│   │   └── auth.module.ts
│   ├── users/                     # Service Pengguna & Data Store
│   │   ├── users.service.ts
│   │   └── users.module.ts
│   ├── entities/                  # Domain Entities & Class Diagram Implementation
│   │   ├── core/                  # Role, User, Session
│   │   ├── fsk/                   # SpesifikasiKebutuhan, DetailKebutuhanFsk, PaketRekomendasi
│   │   ├── logistics/             # Ruangan, PaketRuangan, AlokasiRuangan, Logistik, PaketLogistik, AlokasiLogistik
│   │   ├── workflow/              # PengajuanPeminjaman, Pembina, AturanPeminjaman, TokenKeputusan,
│   │   │                          # KeputusanLogistik, Sbp, Sbpg, DetailPengembalian, HasilPemeriksaan, TemuanPemeriksaan
│   │   └── index.ts
│   ├── app.module.ts
│   └── main.ts                    # Bootstrap NestJS dengan Global ValidationPipe
└── test/
    ├── app.e2e-spec.ts
    └── auth.e2e-spec.ts           # E2E Test Matriks Verifikasi Kasus Login
```

---

## Daftar Class Diagram yang Telah Diinisiasi

Semua 22 class pada domain model spesifikasi TUBES telah diinisiasi dengan access modifier ketat (`+` public getter/method, `-` private field):

1. **Core & Auth:**
   * `Role` (`roles`)
   * `User` (`users`)
   * `Session` (`sessions`)
2. **Kebutuhan & Rekomendasi (FSK):**
   * `SpesifikasiKebutuhan` (`spesifikasi_kebutuhan`)
   * `DetailKebutuhanFsk` (`detail_kebutuhan_fsk`)
   * `PaketRekomendasi` (`paket_rekomendasi`)
3. **Ruangan & Logistik:**
   * `Ruangan` (`ruangan`)
   * `PaketRuangan` (`paket_ruangan`)
   * `AlokasiRuangan` (`alokasi_ruangan`)
   * `Logistik` (`logistik`)
   * `PaketLogistik` (`paket_logistik`)
   * `AlokasiLogistik` (`alokasi_logistik`)
4. **Alur Pengajuan, Persetujuan & Pemeriksaan:**
   * `PengajuanPeminjaman` (`pengajuan_peminjaman`)
   * `Pembina` (`pembina`)
   * `AturanPeminjaman` (`aturan_peminjaman`)
   * `TokenKeputusan` (`token_keputusan`)
   * `KeputusanLogistik` (`keputusan_logistik`)
   * `Sbp` (`sbp`)
   * `Sbpg` (`sbpg`)
   * `DetailPengembalian` (`detail_pengembalian`)
   * `HasilPemeriksaan` (`hasil_pemeriksaan`)
   * `TemuanPemeriksaan` (`temuan_pemeriksaan`)

---

## Menjalankan Backend & Pengujian

### 1. Masuk ke direktori backend
```bash
cd backend
```

### 2. Jalankan Build
```bash
npm run build
```

### 3. Menjalankan Unit Tests
```bash
npm test
```

### 4. Menjalankan E2E Tests (Login Scenarios Verification)
```bash
npm run test:e2e
```

### 5. Menjalankan Server Development
```bash
npm run start:dev
```
Endpoint login tersedia di: `POST http://localhost:3000/auth/login`

**Payload Contoh:**
```json
{
  "email": "mahasiswa@campus.ac.id",
  "password": "password123"
}
```

---

## Hasil Matriks Pengujian Login

* **Kasus Positif:** Kredensial valid (`mahasiswa@campus.ac.id`) -> Status `200 OK`, mengembalikan payload user aman tanpa `password_hash`.
* **Kasus Negatif 1:** Email tidak terdaftar -> Status `401 Unauthorized` (`Email tidak terdaftar`).
* **Kasus Negatif 2:** Password salah -> Status `401 Unauthorized` (`Password salah`).
* **Kasus Negatif 3:** Akun tidak aktif (`inactive@campus.ac.id`) -> Status `403 Forbidden` (`Akun tidak aktif`).
* **Kasus Negatif 4:** Format email tidak valid -> Status `400 Bad Request` (`Format email tidak valid`).
* **Kasus Negatif 5:** Password kurang dari 6 karakter -> Status `400 Bad Request` (`Password minimal 6 karakter`).
