# SmartBooking Campus — TUBES Master Specification & Development Plan

*Prepared for AI Agents (Ponytail & Caveman) & Assignment Submission*

---

## 1. Project Overview & Scope
* **Frontend:** Vite (IMK / User Interface implementation)
* **Backend:** NestJS + TypeScript (REST API & Service Architecture)
* **Database:** MySQL
* **Phase 1 Focus:** Evaluation of normalized class diagrams, strict definition of attributes/methods with access modifiers, and end-to-end implementation of the Login feature. Other business domains remain out of scope for this initial phase.

---

## 2. Evaluation & Normalization of TUBES Class Diagram
Before coding, the system classes have been evaluated and normalized to satisfy object-oriented principles, separation of concerns, and relational database integrity:
1. **Naming Conventions:** Domain classes follow `PascalCase` (e.g., `User`, `Role`, `PengajuanPeminjaman`), while database tables use `snake_case` (`users`, `roles`, `pengajuan_peminjaman`).
2. **Separation of Concerns:** Authentication logic is strictly decoupled from the domain entity (`User`) and handled via `AuthService`, `AuthController`, and `LoginDto`.
3. **Security Standards:** Sensitive fields like `password_hash` are marked private/protected in domain models and explicitly filtered out in response DTOs.

---

## 3. Complete Class Definitions (Attributes, Data Types & Access Modifiers)

Below are the fully defined classes including access modifiers (`+` public, `-` private, `#` protected), data types, and method signatures:

### 3.1. Core System & Authentication Classes
* **`Role`** (Table: `roles`)
  * `- id: number` (+)
  * `- name: string` (+)
  * `+ assignRole(userId: number, roleId: number): boolean`
  * `+ checkPermission(roleId: number, permission: string): boolean`

* **`User`** (Table: `users`)
  * `- id_user: number` (+)
  * `- role_id: number` (+)
  * `- nama: string` (+)
  * `- email: string` (+)
  * `- password_hash: string` (-)
  * `- status_aktif: boolean` (+)
  * `- created_at: Date` (+)
  * `+ login(email: string, pass: string): boolean`
  * `+ logout(sessionId: number): boolean`
  * `+ updateProfil(newData: Partial<User>): boolean`
  * `+ viewDashboard(): object`

* **`Session`** (Table: `sessions`)
  * `- id_session: number` (+)
  * `- id_user: number` (+)
  * `- token_hash: string` (-)
  * `- waktu_dibuat: Date` (+)
  * `- waktu_kedaluwarsa: Date` (+)
  * `- status: string` (+)
  * `+ createSession(userId: number): string`
  * `+ validateSession(token: string): boolean`
  * `+ invalidateSession(sessionId: number): boolean`

---

### 3.2. Requirements & Recommendation (FSK) Classes
* **`SpesifikasiKebutuhan`** (Table: `spesifikasi_kebutuhan`)
  * `- id_fsk: number` (+), `- id_user: number` (+), `- nama_kegiatan: string` (+)
  * `- tanggal_mulai: Date` (+), `- tanggal_selesai: Date` (+)
  * `- waktu_mulai: string` (+), `- waktu_selesai: string` (+)
  * `- jumlah_peserta: number` (+), `- tujuan_kegiatan: string` (+)
  * `- status: string` (+), `- created_at: Date` (+)
  * `+ create(data: object): boolean`, `+ update(id: number, data: object): boolean`
  * `+ validate(): boolean`, `+ viewDetail(id: number): object`

* **`DetailKebutuhanFsk`** (Table: `detail_kebutuhan_fsk`)
  * `- id_detail_kebutuhan: number` (+), `- id_fsk: number` (+)
  * `- kategori: string` (+), `- jenis_kebutuhan: string` (+)
  * `- jumlah: number` (+), `- keterangan: string` (+)
  * `+ addDetail(): boolean`, `+ updateDetail(): boolean`, `+ deleteDetail(): boolean`

* **`PaketRekomendasi`** (Table: `paket_rekomendasi`)
  * `- id_paket: number` (+), `- id_fsk: number` (+)
  * `- nama_paket: string` (+), `- skor: number` (+)
  * `- alasan: string` (+), `- dipilih: boolean` (+), `- dibuat_pada: Date` (+)
  * `+ generate(fskId: number): object`, `+ select(): boolean`
  * `+ update(): boolean`, `+ delete(): boolean`

---

### 3.3. Rooms & Logistics Classes
* **`Ruangan`** (Table: `ruangan`)
  * `- id_ruangan: number` (+), `- nama_ruangan: string` (+)
  * `- jenis: string` (+), `- lokasi: string` (+), `- kapasitas: number` (+)
  * `- kondisi_fasilitas: string` (+), `- status_aktif: boolean` (+)
  * `+ updateStatus(status: boolean): boolean`, `+ viewDetail(): object`

* **`PaketRuangan`** (Table: `paket_ruangan`)
  * `- id_paket_ruangan: number` (+), `- id_paket: number` (+), `- id_ruangan: number` (+)
  * `+ addRoom(): boolean`, `+ removeRoom(): boolean`

* **`AlokasiRuangan`** (Table: `alokasi_ruangan`)
  * `- id_alokasi_ruangan: number` (+), `- id_pengajuan: number` (+), `- id_ruangan: number` (+)
  * `- tanggal_mulai: Date` (+), `- tanggal_selesai: Date` (+), `- status_alokasi: string` (+)
  * `+ allocate(): boolean`, `+ release(): boolean`, `+ update(): boolean`

* **`Logistik`** (Table: `logistik`)
  * `- id_logistik: number` (+), `- nama_logistik: string` (+), `- jenis: string` (+)
  * `- stok_total: number` (+), `- kondisi_fasilitas: string` (+), `- status_aktif: boolean` (+)
  * `+ updateStok(qty: number): boolean`, `+ viewDetail(): object`

* **`PaketLogistik`** (Table: `paket_logistik`)
  * `- id_paket_logistik: number` (+), `- id_paket: number` (+), `- id_logistik: number` (+), `- jumlah: number` (+)
  * `+ addLogistic(): boolean`, `+ updateJumlah(): boolean`, `+ removeLogistic(): boolean`

* **`AlokasiLogistik`** (Table: `alokasi_logistik`)
  * `- id_alokasi_logistik: number` (+), `- id_pengajuan: number` (+), `- id_logistik: number` (+)
  * `- jumlah_dialokasikan: number` (+), `- tanggal_mulai: Date` (+), `- tanggal_selesai: Date` (+), `- status_alokasi: string` (+)
  * `+ allocate(): boolean`, `+ release(): boolean`, `+ update(): boolean`

---

### 3.4. Submission, Approval & Inspection Workflow Classes
* **`PengajuanPeminjaman`** (Table: `pengajuan_peminjaman`)
  * `- id_pengajuan: number` (+), `- id_fsk: number` (+), `- id_paket: number` (+)
  * `- id_pembina: number` (+), `- email_pembina: string` (+), `- id_aturan: number` (+)
  * `- setuju_syarat: boolean` (+), `- waktu_setuju: Date` (+)
  * `- nomor_pengajuan: string` (+), `- tanggal_pengajuan: Date` (+)
  * `- status: string` (+), `- catatan: string` (+)
  * `+ submit(): boolean`, `+ updateStatus(status: string): boolean`, `+ viewHistory(): array`

* **`Pembina`** (Table: `pembina`)
  * `- id_pembina: number` (+), `- nama_pembina: string` (+)
  * `- email_pembina: string` (+), `- status_aktif: boolean` (+)
  * `+ approve(idPengajuan: number): boolean`, `+ reject(idPengajuan: number): boolean`, `+ viewPengajuan(): array`

* **`AturanPeminjaman`** (Table: `aturan_peminjaman`)
  * `- id_aturan: number` (+), `- nama_aturan: string` (+), `- deskripsi: string` (+)
  * `- ketentuan: string` (+), `- aktif: boolean` (+)
  * `+ create(): boolean`, `+ update(): boolean`, `+ delete(): boolean`

* **`TokenKeputusan`** (Table: `token_keputusan`)
  * `- id_notifikasi: number` (+), `- id_pengajuan: number` (+), `- id_token: number` (+)
  * `- dibuat_pada: Date` (+), `- kedaluwarsa_pada: Date` (+), `- waktu_digunakan: Date` (+), `- status: string` (+)
  * `+ generateToken(): string`, `+ validateToken(): boolean`, `+ markAsUsed(): boolean`

* **`KeputusanLogistik`** (Table: `keputusan_logistik`)
  * `- id_keputusan_logistik: number` (+), `- id_pengajuan: number` (+), `- id_user_logistik: number` (+)
  * `- keputusan: string` (+), `- alasan: string` (+), `- waktu_keputusan: Date` (+)
  * `+ approve(): boolean`, `+ reject(): boolean`, `+ update(): boolean`

* **`Sbp` / `Sbpg` & Inspection Classes**
  * **`Sbp`**: `- id_sbp: number`, `- id_pengajuan: number`, `- id_user_penerbit: number`, `- nomor_sbp: string`, `- tanggal_terbit: Date`, `- lokasi_dokumen: string` | Methods: `generate()`, `save()`, `download()`
  * **`Sbpg`**: `- id_sbpg: number`, `- id_pengajuan: number`, `- batas_waktu_kirim: Date`, `- waktu_kirim: Date`, `- status_ketepatan_waktu: string`, `- catatan_peminjam: string`, `- foto_kerusakan: string` | Methods: `generate()`, `save()`, `uploadFoto()`
  * **`DetailPengembalian`**: `- id_detail_pengembalian: number`, `- id_sbpg: number`, `- id_alokasi_ruangan: number`, `- id_alokasi_logistik: number`, `- jumlah_dikembalikan: number`, `- kondisi_kembali: string`, `- catatan: string` | Methods: `addDetail()`, `updateDetail()`, `validate()`
  * **`HasilPemeriksaan`**: `- id_hasil_pemeriksaan: number`, `- id_pengajuan: number`, `- id_sbpg: number`, `- id_user_pemeriksa: number`, `- waktu_pemeriksaan: Date`, `- status_pemeriksaan: string`, `- catatan: string` | Methods: `inspect()`, `updateStatus()`, `complete()`
  * **`TemuanPemeriksaan`**: `- id_temuan: number`, `- id_hasil_pemeriksaan: number`, `- id_logistik: number`, `- id_ruangan: number`, `- jenis_temuan: string`, `- jumlah: number`, `- deskripsi: string`, `- foto_bukti: string` | Methods: `addTemuan()`, `updateTemuan()`, `deleteTemuan()`

---

## 4. Starter Code Skeletons (Phase 1: Login End-to-End)

### 4.1. Login DTO (`src/auth/dto/login.dto.ts`)
```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format email tidak valid' })
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsNotEmpty({ message: 'Password tidak boleh kosong' })
  @MinLength(6, { message: 'Password minimal 6 karakter' })
  password: string;
}
```

### 4.2. Auth Service (`src/auth/auth.service.ts`)
```typescript
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email tidak terdaftar');
    }

    if (!user.status_aktif) {
      throw new ForbiddenException('Akun tidak aktif');
    }

    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    // Return safe user payload (No password hash)
    const { password_hash, ...result } = user;
    return result;
  }
}
```

### 4.3. Auth Controller (`src/auth/auth.controller.ts`)
```typescript
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    return {
      message: 'Login berhasil',
      user: {
        id: user.id_user,
        email: user.email,
        role: user.role,
      },
    };
  }
}
```

---

## 5. Testing Scenarios & Verification Matrix
* **Positive Case:** Valid credentials input -> Status `200 OK`, returns success message and user object without password hash.
* **Negative Cases:**
  * Unregistered email -> `401 Unauthorized`
  * Incorrect password -> `401 Unauthorized`
  * Inactive account -> `403 Forbidden`
  * Missing/invalid email format -> `400 Bad Request` (Validation pipe error)

*Export this document as a PDF to submit before next week's lecture session.*