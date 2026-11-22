USE smartbooking_db;

INSERT INTO roles (id, name) VALUES
(1, 'PEMINJAM'),
(2, 'LOGISTIK'),
(3, 'PEMBINA'),
(4, 'ADMIN')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- Akun login hanya PEMINJAM & LOGISTIK (Pembina = token-only, tanpa akun).
-- Password untuk semua akun: password123
INSERT INTO users (id_user, role_id, nama, email, password_hash, status_aktif) VALUES
(1, 1, 'Mahasiswa Demo (Peminjam)', 'mahasiswa@campus.ac.id', '$2b$10$QI/wsr4RY4x3KTUMqllcSeSamCMlakdbkS5YzqjxIZwqwTo0r9OUO', 1),
(3, 2, 'Ahmad Fauzi (Logistik)', 'logistik@campus.ac.id', '$2b$10$QI/wsr4RY4x3KTUMqllcSeSamCMlakdbkS5YzqjxIZwqwTo0r9OUO', 1),
(4, 1, 'User Nonaktif', 'inactive@campus.ac.id', '$2b$10$QI/wsr4RY4x3KTUMqllcSeSamCMlakdbkS5YzqjxIZwqwTo0r9OUO', 0)
ON DUPLICATE KEY UPDATE nama=VALUES(nama), role_id=VALUES(role_id), password_hash=VALUES(password_hash), status_aktif=VALUES(status_aktif);


INSERT INTO pembina (id_pembina, nama_pembina, email_pembina, status_aktif) VALUES
(1, 'Dr. Ir. Budi Santoso', 'pembina@campus.ac.id', 1),
(2, 'Siti Rahmawati, M.T.', 'siti.rahmawati@campus.ac.id', 1)
ON DUPLICATE KEY UPDATE nama_pembina=VALUES(nama_pembina), status_aktif=VALUES(status_aktif);

INSERT INTO aturan_peminjaman (id_aturan, nama_aturan, deskripsi, ketentuan, aktif) VALUES
(1, 'Ketentuan Umum Peminjaman Fasilitas Kampus', 'Aturan dasar kegiatan kemahasiswaan di lingkungan kampus.', '1. Pengajuan wajib diserahkan minimal 7 hari sebelum kegiatan.\n2. Kegiatan maksimal selesai pukul 21:00 WIB.\n3. Wajib menjaga kebersihan dan mengembalikan fasilitas dalam kondisi awal.\n4. Segala kerusakan wajib dilaporkan pada form SBPG.', 1)
ON DUPLICATE KEY UPDATE nama_aturan=VALUES(nama_aturan), ketentuan=VALUES(ketentuan);

INSERT INTO ruangan (id_ruangan, nama_ruangan, jenis, lokasi, kapasitas, kondisi_fasilitas, status_aktif) VALUES
(1, 'Auditorium Utama Gd. A', 'Auditorium', 'Gedung Rektorat Lt. 3', 350, 'Sangat Baik', 1),
(2, 'Ruang Seminar B-201', 'Ruang Seminar', 'Gedung Perkuliahan B Lt. 2', 80, 'Baik', 1),
(3, 'Laboratorium Komputer Terpadu', 'Laboratorium', 'Gedung Lab Lt. 1', 50, 'Baik', 1),
(4, 'Ruang Rapat UKM', 'Ruang Rapat', 'Gedung Pusat Kegiatan Mahasiswa Lt. 2', 30, 'Baik', 1)
ON DUPLICATE KEY UPDATE nama_ruangan=VALUES(nama_ruangan), kapasitas=VALUES(kapasitas);

INSERT INTO logistik (id_logistik, nama_logistik, jenis, stok_total, kondisi_fasilitas, status_aktif) VALUES
(1, 'Proyektor Epson EB-X400', 'Elektronik', 15, 'Baik', 1),
(2, 'Wireless Microphone Set (2 Mic)', 'Audio', 10, 'Baik', 1),
(3, 'Portable Sound System 200W', 'Audio', 6, 'Baik', 1),
(4, 'Kabel Roll 25 Meter', 'Kelistrikan', 25, 'Baik', 1),
(5, 'Kursi Lipat Chitose', 'Furnitur', 200, 'Baik', 1),
(6, 'Meja Registrasi Lipat', 'Furnitur', 20, 'Baik', 1)
ON DUPLICATE KEY UPDATE nama_logistik=VALUES(nama_logistik), stok_total=VALUES(stok_total);
