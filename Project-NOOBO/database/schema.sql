
CREATE DATABASE IF NOT EXISTS smartbooking_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartbooking_db;


CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
  id_user INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sessions (
  id_session INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  waktu_dibuat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  waktu_kedaluwarsa TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT fk_sessions_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS spesifikasi_kebutuhan (
  id_fsk INT AUTO_INCREMENT PRIMARY KEY,
  id_user INT NOT NULL,
  nama_kegiatan VARCHAR(255) NOT NULL,
  tanggal_mulai DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  waktu_mulai VARCHAR(10) NOT NULL,
  waktu_selesai VARCHAR(10) NOT NULL,
  jumlah_peserta INT NOT NULL,
  tujuan_kegiatan TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fsk_user FOREIGN KEY (id_user) REFERENCES users(id_user) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS detail_kebutuhan_fsk (
  id_detail_kebutuhan INT AUTO_INCREMENT PRIMARY KEY,
  id_fsk INT NOT NULL,
  kategori VARCHAR(50) NOT NULL,
  jenis_kebutuhan VARCHAR(100) NOT NULL,
  jumlah INT NOT NULL DEFAULT 1,
  keterangan TEXT,
  CONSTRAINT fk_detail_fsk FOREIGN KEY (id_fsk) REFERENCES spesifikasi_kebutuhan(id_fsk) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paket_rekomendasi (
  id_paket INT AUTO_INCREMENT PRIMARY KEY,
  id_fsk INT NOT NULL,
  nama_paket VARCHAR(100) NOT NULL,
  skor DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  alasan TEXT NOT NULL,
  dipilih BOOLEAN NOT NULL DEFAULT FALSE,
  dibuat_pada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_paket_fsk FOREIGN KEY (id_fsk) REFERENCES spesifikasi_kebutuhan(id_fsk) ON DELETE CASCADE
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS ruangan (
  id_ruangan INT AUTO_INCREMENT PRIMARY KEY,
  nama_ruangan VARCHAR(100) NOT NULL,
  jenis VARCHAR(50) NOT NULL,
  lokasi VARCHAR(100) NOT NULL,
  kapasitas INT NOT NULL,
  kondisi_fasilitas VARCHAR(50) NOT NULL DEFAULT 'Baik',
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paket_ruangan (
  id_paket_ruangan INT AUTO_INCREMENT PRIMARY KEY,
  id_paket INT NOT NULL,
  id_ruangan INT NOT NULL,
  CONSTRAINT fk_paket_ruangan_paket FOREIGN KEY (id_paket) REFERENCES paket_rekomendasi(id_paket) ON DELETE CASCADE,
  CONSTRAINT fk_paket_ruangan_ruangan FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS logistik (
  id_logistik INT AUTO_INCREMENT PRIMARY KEY,
  nama_logistik VARCHAR(100) NOT NULL,
  jenis VARCHAR(50) NOT NULL,
  stok_total INT NOT NULL DEFAULT 0,
  kondisi_fasilitas VARCHAR(50) NOT NULL DEFAULT 'Baik',
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS paket_logistik (
  id_paket_logistik INT AUTO_INCREMENT PRIMARY KEY,
  id_paket INT NOT NULL,
  id_logistik INT NOT NULL,
  jumlah INT NOT NULL DEFAULT 1,
  CONSTRAINT fk_paket_logistik_paket FOREIGN KEY (id_paket) REFERENCES paket_rekomendasi(id_paket) ON DELETE CASCADE,
  CONSTRAINT fk_paket_logistik_logistik FOREIGN KEY (id_logistik) REFERENCES logistik(id_logistik) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pembina (
  id_pembina INT AUTO_INCREMENT PRIMARY KEY,
  nama_pembina VARCHAR(100) NOT NULL,
  email_pembina VARCHAR(100) NOT NULL UNIQUE,
  status_aktif BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS aturan_peminjaman (
  id_aturan INT AUTO_INCREMENT PRIMARY KEY,
  nama_aturan VARCHAR(150) NOT NULL,
  deskripsi TEXT,
  ketentuan TEXT NOT NULL,
  aktif BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS pengajuan_peminjaman (
  id_pengajuan INT AUTO_INCREMENT PRIMARY KEY,
  id_fsk INT NOT NULL,
  id_paket INT NULL,
  id_pembina INT NULL,
  email_pembina VARCHAR(100) NOT NULL,
  id_aturan INT NOT NULL,
  setuju_syarat BOOLEAN NOT NULL DEFAULT FALSE,
  waktu_setuju DATETIME NULL,
  nomor_pengajuan VARCHAR(50) NOT NULL UNIQUE,
  tanggal_pengajuan DATETIME DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN_PEMBINA',
  catatan TEXT,
  CONSTRAINT fk_pengajuan_fsk FOREIGN KEY (id_fsk) REFERENCES spesifikasi_kebutuhan(id_fsk),
  CONSTRAINT fk_pengajuan_paket FOREIGN KEY (id_paket) REFERENCES paket_rekomendasi(id_paket),
  CONSTRAINT fk_pengajuan_pembina FOREIGN KEY (id_pembina) REFERENCES pembina(id_pembina),
  CONSTRAINT fk_pengajuan_aturan FOREIGN KEY (id_aturan) REFERENCES aturan_peminjaman(id_aturan)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alokasi_ruangan (
  id_alokasi_ruangan INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  id_ruangan INT NOT NULL,
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME NOT NULL,
  status_alokasi VARCHAR(50) NOT NULL DEFAULT 'ALLOCATED',
  CONSTRAINT fk_alokasi_ruangan_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE,
  CONSTRAINT fk_alokasi_ruangan_ruangan FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alokasi_logistik (
  id_alokasi_logistik INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  id_logistik INT NOT NULL,
  jumlah_dialokasikan INT NOT NULL DEFAULT 1,
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME NOT NULL,
  status_alokasi VARCHAR(50) NOT NULL DEFAULT 'ALLOCATED',
  CONSTRAINT fk_alokasi_logistik_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE,
  CONSTRAINT fk_alokasi_logistik_logistik FOREIGN KEY (id_logistik) REFERENCES logistik(id_logistik) ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS token_keputusan (
  id_notifikasi INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  id_token INT NOT NULL,
  dibuat_pada DATETIME DEFAULT CURRENT_TIMESTAMP,
  kedaluwarsa_pada DATETIME NOT NULL,
  waktu_digunakan DATETIME NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'UNUSED',
  CONSTRAINT fk_token_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS keputusan_logistik (
  id_keputusan_logistik INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  id_user_logistik INT NOT NULL,
  keputusan VARCHAR(50) NOT NULL,
  alasan TEXT,
  waktu_keputusan DATETIME DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_keputusan_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE,
  CONSTRAINT fk_keputusan_user FOREIGN KEY (id_user_logistik) REFERENCES users(id_user)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sbp (
  id_sbp INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL UNIQUE,
  id_user_penerbit INT NOT NULL,
  nomor_sbp VARCHAR(50) NOT NULL UNIQUE,
  tanggal_terbit DATETIME DEFAULT CURRENT_TIMESTAMP,
  lokasi_dokumen VARCHAR(255) NOT NULL,
  CONSTRAINT fk_sbp_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE,
  CONSTRAINT fk_sbp_user FOREIGN KEY (id_user_penerbit) REFERENCES users(id_user)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sbpg (
  id_sbpg INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL UNIQUE,
  batas_waktu_kirim DATETIME NOT NULL,
  waktu_kirim DATETIME NOT NULL,
  status_ketepatan_waktu VARCHAR(50) NOT NULL DEFAULT 'TEPAT_WAKTU',
  catatan_peminjam TEXT,
  foto_kerusakan VARCHAR(255),
  CONSTRAINT fk_sbpg_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS detail_pengembalian (
  id_detail_pengembalian INT AUTO_INCREMENT PRIMARY KEY,
  id_sbpg INT NOT NULL,
  id_alokasi_ruangan INT NULL,
  id_alokasi_logistik INT NULL,
  jumlah_dikembalikan INT NOT NULL DEFAULT 0,
  kondisi_kembali VARCHAR(50) NOT NULL,
  catatan TEXT,
  CONSTRAINT fk_detail_kembali_sbpg FOREIGN KEY (id_sbpg) REFERENCES sbpg(id_sbpg) ON DELETE CASCADE,
  CONSTRAINT fk_detail_kembali_ruangan FOREIGN KEY (id_alokasi_ruangan) REFERENCES alokasi_ruangan(id_alokasi_ruangan) ON DELETE SET NULL,
  CONSTRAINT fk_detail_kembali_logistik FOREIGN KEY (id_alokasi_logistik) REFERENCES alokasi_logistik(id_alokasi_logistik) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS hasil_pemeriksaan (
  id_hasil_pemeriksaan INT AUTO_INCREMENT PRIMARY KEY,
  id_pengajuan INT NOT NULL,
  id_sbpg INT NOT NULL,
  id_user_pemeriksa INT NOT NULL,
  waktu_pemeriksaan DATETIME DEFAULT CURRENT_TIMESTAMP,
  status_pemeriksaan VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
  catatan TEXT,
  CONSTRAINT fk_hasil_pengajuan FOREIGN KEY (id_pengajuan) REFERENCES pengajuan_peminjaman(id_pengajuan) ON DELETE CASCADE,
  CONSTRAINT fk_hasil_sbpg FOREIGN KEY (id_sbpg) REFERENCES sbpg(id_sbpg) ON DELETE CASCADE,
  CONSTRAINT fk_hasil_user FOREIGN KEY (id_user_pemeriksa) REFERENCES users(id_user)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS temuan_pemeriksaan (
  id_temuan INT AUTO_INCREMENT PRIMARY KEY,
  id_hasil_pemeriksaan INT NOT NULL,
  id_logistik INT NULL,
  id_ruangan INT NULL,
  jenis_temuan VARCHAR(50) NOT NULL,
  jumlah INT NOT NULL DEFAULT 1,
  deskripsi TEXT NOT NULL,
  foto_bukti VARCHAR(255),
  CONSTRAINT fk_temuan_hasil FOREIGN KEY (id_hasil_pemeriksaan) REFERENCES hasil_pemeriksaan(id_hasil_pemeriksaan) ON DELETE CASCADE,
  CONSTRAINT fk_temuan_logistik FOREIGN KEY (id_logistik) REFERENCES logistik(id_logistik) ON DELETE SET NULL,
  CONSTRAINT fk_temuan_ruangan FOREIGN KEY (id_ruangan) REFERENCES ruangan(id_ruangan) ON DELETE SET NULL
) ENGINE=InnoDB;
