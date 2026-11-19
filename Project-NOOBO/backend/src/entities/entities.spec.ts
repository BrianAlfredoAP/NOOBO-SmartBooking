import { describe, it, expect } from 'vitest';
import {
  Role,
  User,
  Session,
  SpesifikasiKebutuhan,
  DetailKebutuhanFsk,
  PaketRekomendasi,
  Ruangan,
  PaketRuangan,
  AlokasiRuangan,
  Logistik,
  PaketLogistik,
  AlokasiLogistik,
  PengajuanPeminjaman,
  Pembina,
  AturanPeminjaman,
  TokenKeputusan,
  KeputusanLogistik,
  Sbp,
  Sbpg,
  DetailPengembalian,
  HasilPemeriksaan,
  TemuanPemeriksaan,
} from './index.js';

describe('Domain Entities Initialization & Behavior', () => {
  describe('Core System & Authentication Entities', () => {
    it('should initialize Role and test methods', () => {
      const role = new Role(1, 'Mahasiswa');
      expect(role.id).toBe(1);
      expect(role.name).toBe('Mahasiswa');
      expect(role.assignRole(10, 2)).toBe(true);
      expect(role.checkPermission(2, 'CREATE_FSK')).toBe(true);
      expect(role.checkPermission(0, '')).toBe(false);
    });

    it('should initialize User and test access modifiers and methods', () => {
      const user = new User(1, 1, 'John Doe', 'john@campus.ac.id', '$2b$10$hashedpassword', true);
      expect(user.id_user).toBe(1);
      expect(user.nama).toBe('John Doe');
      expect(user.email).toBe('john@campus.ac.id');
      expect(user.status_aktif).toBe(true);
      // password_hash is private and not exposed via public getter
      expect((user as any).password_hash).toBeUndefined();
      expect(user.getPasswordHash()).toBe('$2b$10$hashedpassword');
      expect(user.login('john@campus.ac.id', 'secret')).toBe(true);
      expect(user.logout(101)).toBe(true);
      expect(user.updateProfil({ nama: 'John Updated' })).toBe(true);
      expect(user.nama).toBe('John Updated');
      const dashboard = user.viewDashboard();
      expect(dashboard).toHaveProperty('userId', 1);
    });

    it('should initialize Session and test lifecycle methods', () => {
      const session = new Session(1, 10, 'secret_token_hash');
      expect(session.id_session).toBe(1);
      expect(session.id_user).toBe(10);
      expect(session.status).toBe('ACTIVE');
      const token = session.createSession(10);
      expect(token).toBeDefined();
      expect(session.validateSession(token)).toBe(true);
      expect(session.invalidateSession(1)).toBe(true);
      expect(session.status).toBe('EXPIRED');
    });
  });

  describe('Requirements & Recommendation (FSK) Entities', () => {
    it('should initialize SpesifikasiKebutuhan', () => {
      const fsk = new SpesifikasiKebutuhan(
        1,
        10,
        'Seminar Nasional AI',
        new Date('2026-11-01'),
        new Date('2026-11-02'),
        '08:00',
        '17:00',
        150,
        'Meningkatkan literasi AI',
      );
      expect(fsk.id_fsk).toBe(1);
      expect(fsk.validate()).toBe(true);
      expect(fsk.update(1, { nama_kegiatan: 'Seminar Internasional AI' })).toBe(true);
      expect(fsk.nama_kegiatan).toBe('Seminar Internasional AI');
      const detail = fsk.viewDetail(1);
      expect(detail).toHaveProperty('nama_kegiatan');
    });

    it('should initialize DetailKebutuhanFsk', () => {
      const detail = new DetailKebutuhanFsk(1, 100, 'Ruangan', 'Auditorium', 1, 'Kapasitas 200');
      expect(detail.id_detail_kebutuhan).toBe(1);
      expect(detail.addDetail()).toBe(true);
      expect(detail.updateDetail({ jumlah: 2 })).toBe(true);
      expect(detail.jumlah).toBe(2);
      expect(detail.deleteDetail()).toBe(true);
    });

    it('should initialize PaketRekomendasi', () => {
      const paket = new PaketRekomendasi(1, 100, 'Paket Standar', 90, 'Kapasitas cukup');
      expect(paket.id_paket).toBe(1);
      const generated = paket.generate(100);
      expect(generated).toHaveProperty('skor');
      expect(paket.select()).toBe(true);
      expect(paket.dipilih).toBe(true);
      expect(paket.update({ skor: 98 })).toBe(true);
      expect(paket.delete()).toBe(true);
    });
  });

  describe('Rooms & Logistics Entities', () => {
    it('should initialize Ruangan, PaketRuangan, and AlokasiRuangan', () => {
      const room = new Ruangan(1, 'Auditorium Gd. A', 'Auditorium', 'Lantai 3', 300, 'Baik', true);
      expect(room.id_ruangan).toBe(1);
      expect(room.updateStatus(false)).toBe(true);
      expect(room.status_aktif).toBe(false);

      const paketRoom = new PaketRuangan(1, 10, 1);
      expect(paketRoom.addRoom()).toBe(true);
      expect(paketRoom.removeRoom()).toBe(true);

      const alokasi = new AlokasiRuangan(1, 5, 1, new Date(), new Date());
      expect(alokasi.allocate()).toBe(true);
      expect(alokasi.release()).toBe(true);
      expect(alokasi.status_alokasi).toBe('RELEASED');
    });

    it('should initialize Logistik, PaketLogistik, and AlokasiLogistik', () => {
      const logistik = new Logistik(1, 'Proyektor Epson', 'Elektronik', 10, 'Baik', true);
      expect(logistik.id_logistik).toBe(1);
      expect(logistik.updateStok(-2)).toBe(true);
      expect(logistik.stok_total).toBe(8);

      const paketLog = new PaketLogistik(1, 10, 1, 2);
      expect(paketLog.addLogistic()).toBe(true);
      expect(paketLog.updateJumlah(5)).toBe(true);
      expect(paketLog.removeLogistic()).toBe(true);

      const alokasiLog = new AlokasiLogistik(1, 5, 1, 2, new Date(), new Date());
      expect(alokasiLog.allocate()).toBe(true);
      expect(alokasiLog.release()).toBe(true);
      expect(alokasiLog.update(3)).toBe(true);
    });
  });

  describe('Submission, Approval & Inspection Workflow Entities', () => {
    it('should initialize PengajuanPeminjaman, Pembina, and AturanPeminjaman', () => {
      const pengajuan = new PengajuanPeminjaman(
        1,
        100,
        10,
        5,
        'pembina@campus.ac.id',
        1,
        true,
        new Date(),
        'REQ-2026-001',
      );
      expect(pengajuan.submit()).toBe(true);
      expect(pengajuan.status).toBe('MENUNGGU_PERSETUJUAN_PEMBINA');
      expect(pengajuan.updateStatus('DISETUJUI')).toBe(true);
      expect(pengajuan.viewHistory().length).toBeGreaterThan(0);

      const pembina = new Pembina(5, 'Dr. Budi', 'pembina@campus.ac.id', true);
      expect(pembina.approve(1)).toBe(true);
      expect(pembina.reject(1)).toBe(true);

      const aturan = new AturanPeminjaman(1, 'Aturan Jam Malam', 'Maksimal jam 21:00', 'Wajib lapor satpam');
      expect(aturan.create()).toBe(true);
      expect(aturan.update({ nama_aturan: 'Aturan Revisi' })).toBe(true);
      expect(aturan.delete()).toBe(true);
      expect(aturan.aktif).toBe(false);
    });

    it('should initialize TokenKeputusan and KeputusanLogistik', () => {
      const token = new TokenKeputusan(1, 1, 101);
      const generated = token.generateToken();
      expect(generated).toBeDefined();
      expect(token.validateToken()).toBe(true);
      expect(token.markAsUsed()).toBe(true);
      expect(token.status).toBe('USED');

      const keputusan = new KeputusanLogistik(1, 1, 20);
      expect(keputusan.approve()).toBe(true);
      expect(keputusan.keputusan).toBe('APPROVED');
      expect(keputusan.reject('Stok tidak memadai')).toBe(true);
      expect(keputusan.keputusan).toBe('REJECTED');
    });

    it('should initialize Sbp, Sbpg, DetailPengembalian, HasilPemeriksaan, and TemuanPemeriksaan', () => {
      const sbp = new Sbp(1, 1, 10, 'SBP-001');
      const genSbp = sbp.generate();
      expect(genSbp).toHaveProperty('nomor_sbp');
      expect(sbp.save()).toBe(true);
      expect(sbp.download()).toBeDefined();

      const sbpg = new Sbpg(1, 1, new Date(Date.now() + 3600000));
      expect(sbpg.generate()).toHaveProperty('status_ketepatan_waktu');
      expect(sbpg.uploadFoto('/photos/proof.jpg')).toBe(true);

      const detailKembali = new DetailPengembalian(1, 1, 1, 1, 1, 'Baik');
      expect(detailKembali.addDetail()).toBe(true);
      expect(detailKembali.validate()).toBe(true);

      const hasil = new HasilPemeriksaan(1, 1, 1, 5);
      expect(hasil.inspect()).toBe(true);
      expect(hasil.complete()).toBe(true);
      expect(hasil.status_pemeriksaan).toBe('COMPLETED');

      const temuan = new TemuanPemeriksaan(1, 1, 1, 1, 'Kerusakan', 1, 'Layar retak');
      expect(temuan.addTemuan()).toBe(true);
      expect(temuan.updateTemuan({ deskripsi: 'Layar tergores' })).toBe(true);
      expect(temuan.deleteTemuan()).toBe(true);
    });
  });
});
