import { describe, expect, it, vi } from 'vitest';
import {
  PENGAJUAN_STATUS,
  canTransition,
  statusLabel,
} from './entities/workflow/pengajuan-status.js';
import { toRequestView } from './loan-requests/loan-requests.mapper.js';
import { NotificationsRepository } from './notifications/notifications.repository.js';
import { LogisticsService } from './logistics/logistics.service.js';

const user = { id: 1, email: 'mahasiswa@campus.ac.id', role: 'PEMINJAM' };

describe('Workflow status alignment with frontend', () => {
  it('supports the Perlu Perbaikan (revision) loop', () => {
    expect(
      canTransition(
        PENGAJUAN_STATUS.WAITING_LOGISTIK,
        PENGAJUAN_STATUS.REVISION_LOGISTIK,
      ),
    ).toBe(true);
    expect(
      canTransition(
        PENGAJUAN_STATUS.REVISION_LOGISTIK,
        PENGAJUAN_STATUS.WAITING_LOGISTIK,
      ),
    ).toBe(true);
    expect(
      canTransition(
        PENGAJUAN_STATUS.REVISION_LOGISTIK,
        PENGAJUAN_STATUS.ONGOING,
      ),
    ).toBe(false);
    expect(statusLabel('REVISION_LOGISTIK')).toBe('Perlu Perbaikan');
    expect(statusLabel('WAITING_LOGISTIK')).toBe(
      'Menunggu Pemeriksaan Logistik',
    );
  });

  it('maps a request row to the frontend application shape', () => {
    const row = {
      id_pengajuan: 7,
      nomor_pengajuan: 'FPP-20260101-ABCD1234',
      id_fsk: 3,
      id_paket: 5,
      status: 'APPROVED_LOGISTIK',
      tanggal_mulai: '2026-11-12',
      tanggal_selesai: '2026-11-12',
      waktu_mulai: '13:00',
      waktu_selesai: '15:00',
      jumlah_peserta: 28,
      tujuan_kegiatan: 'Koordinasi',
      nama_kegiatan: 'Rapat Koordinasi UKM',
      borrower_nama: 'Aria Restu',
      borrower_email: 'mahasiswa@campus.ac.id',
      organization: 'UKM Kampus',
      whatsapp: '0812',
      email_pembina: 'pembina@campus.ac.id',
      alasan_penolakan: null,
      catatan_logistik: 'Disetujui',
      nomor_sbp: null,
      id_sbpg: null,
    };
    const pkg = {
      room: {
        id_ruangan: 2,
        nama_ruangan: 'Ruang Rapat D-201',
        gedung: 'Gedung D',
        lantai: '2',
        jenis: 'Ruang Rapat',
        kapasitas: 40,
        fasilitas: '["Proyektor","Papan tulis"]',
        kondisi_fasilitas: 'Baik',
        status_aktif: 1,
      },
      logistics: [
        {
          id_logistik: 1,
          nama_logistik: 'Proyektor',
          jenis: 'Elektronik',
          jumlah: 2,
          satuan: 'unit',
          stok_total: 15,
        },
      ],
    };

    const view = toRequestView(row, pkg);

    expect(view.id).toBe('7');
    expect(view.status).toBe('Disetujui');
    expect(view.canIssueSbp).toBe(true);
    expect(view.borrower).toMatchObject({
      name: 'Aria Restu',
      organization: 'UKM Kampus',
      whatsapp: '0812',
    });
    expect(view.event).toMatchObject({
      name: 'Rapat Koordinasi UKM',
      date: '2026-11-12',
      participants: 28,
    });
    expect(view.room).toMatchObject({
      name: 'Ruang Rapat D-201',
      building: 'Gedung D',
      equipment: ['Proyektor', 'Papan tulis'],
    });
    expect(view.logistics[0]).toMatchObject({
      label: 'Proyektor',
      quantity: 2,
      unit: 'unit',
    });
  });
});

describe('NotificationsRepository (mock pool)', () => {
  it('creates and marks notifications read', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([{ insertId: 11 }, []])
      .mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const repository = new NotificationsRepository({ execute } as never);

    const id = await repository.create({
      id_user: 1,
      id_pengajuan: 7,
      judul: 'Pengajuan Disetujui',
      isi: 'Rapat Koordinasi UKM disetujui.',
      kategori: 'Persetujuan',
    });
    expect(id).toBe(11);
    expect(execute.mock.calls[0][1]).toEqual([
      1,
      7,
      'Pengajuan Disetujui',
      'Rapat Koordinasi UKM disetujui.',
      'Persetujuan',
    ]);

    expect(await repository.markRead(11, 1)).toBe(true);
    expect(execute.mock.calls[1][1]).toEqual([11, 1]);
  });
});

describe('LogisticsService decision validation', () => {
  it('requires a reason for REJECT/REVISION before touching the database', async () => {
    const repository = { decide: vi.fn() };
    const service = new LogisticsService(
      repository as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    await expect(
      service.decide(7, { keputusan: 'REJECT' }, user),
    ).rejects.toMatchObject({ code: 'LOGISTICS_REASON_REQUIRED' });
    expect(repository.decide).not.toHaveBeenCalled();
  });
});
