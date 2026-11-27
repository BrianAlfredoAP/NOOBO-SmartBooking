import { describe, expect, it, vi } from 'vitest';
import { LoanRequestsRepository } from '../loan-requests/loan-requests.repository.js';
import { LogisticsService } from './logistics.service.js';

const logistikUser = { id: 3, email: 'logistik@campus.ac.id', role: 'LOGISTIK' };

function setup() {
  const repository = {
    decide: vi.fn(),
    planForRequest: vi.fn().mockResolvedValue({ rooms: [], logistics: [] }),
    checkAvailability: vi.fn().mockResolvedValue([]),
  };
  const requests = {
    findDetail: vi.fn().mockResolvedValue({
      id_pengajuan: 7,
      id_paket: 5,
      id_user: 1,
      status: 'WAITING_LOGISTIK',
      nomor_pengajuan: 'FPP-20260101-ABCD',
      borrower_nama: 'Aria',
      borrower_email: 'mahasiswa@campus.ac.id',
      nama_kegiatan: 'Rapat',
      tanggal_mulai: '2026-11-12',
      tanggal_selesai: '2026-11-12',
      waktu_mulai: '13:00',
      waktu_selesai: '15:00',
    }),
    findMany: vi.fn().mockResolvedValue({ rows: [], total: 0 }),
    findPackageLines: vi.fn().mockResolvedValue({ room: null, logistics: [] }),
    listHistory: vi.fn().mockResolvedValue([]),
    listReturnDetails: vi.fn().mockResolvedValue([]),
    listAllocations: vi.fn().mockResolvedValue({ rooms: [], items: [] }),
    findInspection: vi.fn().mockResolvedValue({ hasil: null, temuan: [] }),
    recordInspection: vi.fn(),
    inspect: vi.fn(),
    listOngoing: vi.fn().mockResolvedValue([]),
  };
  const notifications = { notify: vi.fn().mockResolvedValue(1) };
  const emailService = { send: vi.fn().mockResolvedValue({ status: 'SENT' }) };
  const sbp = { issue: vi.fn() };

  const service = new LogisticsService(
    repository as never,
    requests as never,
    notifications as never,
    emailService as never,
    sbp as never,
  );
  return { repository, requests, notifications, emailService, service };
}

describe('LogisticsService', () => {
  it('requires a reason for REJECT and REVISION without touching the repository', async () => {
    const { repository, service } = setup();

    await expect(
      service.decide(7, { keputusan: 'REJECT' }, logistikUser),
    ).rejects.toMatchObject({ code: 'LOGISTICS_REASON_REQUIRED' });
    await expect(
      service.decide(7, { keputusan: 'REVISION', alasan: '   ' }, logistikUser),
    ).rejects.toMatchObject({ code: 'LOGISTICS_REASON_REQUIRED' });
    expect(repository.decide).not.toHaveBeenCalled();
  });

  it('maps a room clash to ROOM_CONFLICT with details', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'UNAVAILABLE',
      issues: [
        { type: 'ROOM_CONFLICT', id_ruangan: 3, nama_ruangan: 'Ruang UKM' },
      ],
    });

    await expect(
      service.decide(7, { keputusan: 'APPROVE' }, logistikUser),
    ).rejects.toMatchObject({
      code: 'ROOM_CONFLICT',
      status: 409,
    });
  });

  it('maps a stock shortfall to STOCK_INSUFFICIENT', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'UNAVAILABLE',
      issues: [
        {
          type: 'STOCK_INSUFFICIENT',
          id_logistik: 1,
          nama_logistik: 'Proyektor',
          diminta: 5,
          tersedia: 3,
        },
      ],
    });

    await expect(
      service.decide(7, { keputusan: 'APPROVE' }, logistikUser),
    ).rejects.toMatchObject({ code: 'STOCK_INSUFFICIENT', status: 409 });
  });

  it('notifies the Peminjam and queues an email on a decision', async () => {
    const { repository, notifications, emailService, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'OK',
      previous_status: 'WAITING_LOGISTIK',
      status: 'APPROVED_LOGISTIK',
      id_user: 1,
      nama_kegiatan: 'Rapat',
    });

    const result = await service.decide(
      7,
      { keputusan: 'APPROVE' },
      logistikUser,
    );

    expect(result.data).toMatchObject({
      status: 'APPROVED_LOGISTIK',
      availability_locked: true,
    });
    expect(notifications.notify).toHaveBeenCalledOnce();
    expect(emailService.send).toHaveBeenCalledOnce();
    expect(emailService.send.mock.calls[0][0]).toMatchObject({
      to_email: 'mahasiswa@campus.ac.id',
      template: 'PEMINJAM_LOGISTICS_DECISION',
    });
  });

  it('exposes current availability in the detail view', async () => {
    const { repository, service } = setup();
    repository.checkAvailability.mockResolvedValue([
      { type: 'ROOM_CONFLICT', nama_ruangan: 'Ruang UKM' },
    ]);

    const result = await service.detail(7);

    expect(result.data.availability).toMatchObject({
      available: false,
      issues: [{ type: 'ROOM_CONFLICT' }],
    });
  });

  it('rejects a decision on a request that is no longer pending Logistics', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'NOT_PENDING',
      status: 'ONGOING',
    });

    await expect(
      service.decide(7, { keputusan: 'APPROVE' }, logistikUser),
    ).rejects.toMatchObject({ code: 'LOGISTICS_NOT_PENDING' });
  });

  it('maps PENDING_INSPECTION filter to RETURN_REPORTED in returnsQueue', async () => {
    const { requests, service } = setup();

    await service.returnsQueue({
      status: 'PENDING_INSPECTION',
      page: 1,
      limit: 10,
    });

    expect(requests.findMany).toHaveBeenCalledWith({
      status: 'RETURN_REPORTED',
      idUser: null,
      page: 1,
      limit: 10,
    });
  });

  it('deducts LOST stock, flags DAMAGED condition, and releases allocations on completeReturn', async () => {
    const executedSql: Array<{ sql: string; params: unknown[] }> = [];
    const execute = vi.fn(async (sql: string, params: unknown[] = []) => {
      executedSql.push({ sql, params });
      if (sql.includes('FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1 FOR UPDATE')) {
        return [[{ id_pengajuan: 7, status: 'RETURN_REPORTED' }], []];
      }
      if (sql.includes('SELECT id_sbpg FROM sbpg')) {
        return [[{ id_sbpg: 12 }], []];
      }
      if (sql.includes('SELECT id_hasil_pemeriksaan FROM hasil_pemeriksaan')) {
        return [[], []];
      }
      if (sql.includes('INSERT INTO hasil_pemeriksaan')) {
        return [{ insertId: 99 }, []];
      }
      return [{ affectedRows: 1 }, []];
    });

    const connection = {
      execute,
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };
    const realRequestsRepo = new LoanRequestsRepository({
      execute,
      getConnection: vi.fn().mockResolvedValue(connection),
    } as never);
    vi.spyOn(realRequestsRepo, 'findDetail').mockResolvedValue({
      id_pengajuan: 7,
      id_user: 1,
      nama_kegiatan: 'Seminar AI',
    } as never);

    const { repository, notifications, emailService } = setup();
    const service = new LogisticsService(
      repository as never,
      realRequestsRepo,
      notifications as never,
      emailService as never,
      {} as never,
    );

    const res = await service.completeReturn(
      7,
      {
        catatan: '1 mic hilang, 1 proyektor rusak',
        temuan: [
          {
            id_logistik: 4,
            jenis_temuan: 'LOST',
            jumlah: 1,
            deskripsi: 'Mic wireless hilang',
          },
          {
            id_logistik: 2,
            jenis_temuan: 'DAMAGED',
            jumlah: 1,
            deskripsi: 'Lensa proyektor retak',
          },
        ],
      },
      logistikUser,
    );

    expect(res.data).toMatchObject({
      id_hasil_pemeriksaan: 99,
      status: 'COMPLETED',
      jumlah_temuan: 2,
      lost_stock_deducted: 1,
      damaged_items_flagged: 1,
    });
    expect(
      executedSql.some(
        (call) =>
          call.sql.includes('stok_total = GREATEST(0, stok_total - ?)') &&
          call.params[0] === 1 &&
          call.params[1] === 4,
      ),
    ).toBe(true);
    expect(
      executedSql.some(
        (call) =>
          call.sql.includes("UPDATE logistik SET kondisi_fasilitas = 'Rusak'") &&
          call.params[0] === 2,
      ),
    ).toBe(true);
    expect(notifications.notify).toHaveBeenCalledOnce();
  });
});
