import { describe, expect, it, vi } from 'vitest';
import { LogisticsRepository } from './logistics.repository.js';

const requestRow = (status: string) => ({
  id_pengajuan: 7,
  id_fsk: 1,
  id_paket: 5,
  id_pembina: 2,
  email_pembina: 'pembina@campus.ac.id',
  id_aturan: 1,
  setuju_syarat: 1,
  waktu_setuju: new Date(),
  nomor_pengajuan: 'FPP-20260101-ABCD',
  tanggal_pengajuan: new Date(),
  status,
  catatan: null,
  alasan_penolakan: null,
  catatan_logistik: null,
  id_user: 1,
  nama_kegiatan: 'Rapat Koordinasi',
  tanggal_mulai: '2099-01-10',
  tanggal_selesai: '2099-01-10',
  waktu_mulai: '08:00',
  waktu_selesai: '17:00',
  jumlah_peserta: 10,
  tujuan_kegiatan: 'Koordinasi',
});

function createConnection() {
  const execute = vi.fn();
  return {
    execute,
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    release: vi.fn(),
  };
}

describe('LogisticsRepository — transactional availability locking', () => {
  it('locks the master room row before writing an allocation', async () => {
    const connection = createConnection();
    connection.execute.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM pengajuan_peminjaman p')) {
        return [[requestRow('WAITING_LOGISTIK')], []];
      }
      if (sql.includes('FROM paket_ruangan')) return [[{ id_ruangan: 3 }], []];
      if (sql.includes('FROM paket_logistik')) {
        return [[{ id_logistik: 1, jumlah: 2 }], []];
      }
      if (sql.includes('FROM ruangan WHERE id_ruangan')) {
        return [[{ id_ruangan: 3 }], []];
      }
      if (sql.includes('FROM logistik WHERE id_logistik')) {
        return [[{ id_logistik: 1 }], []];
      }
      if (sql.includes('FROM alokasi_ruangan a')) return [[], []];
      if (sql.includes('FROM logistik l')) {
        return [[{ nama_logistik: 'Proyektor', stok_total: 15, terpakai: 0 }], []];
      }
      return [[], []];
    });

    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    const outcome = await repo.decide(7, 3, { keputusan: 'APPROVE' });

    expect(outcome.outcome).toBe('OK');
    expect(connection.commit).toHaveBeenCalledOnce();

    const lockCalls = connection.execute.mock.calls
      .map(([sql]: [string]) => sql)
      .filter((sql: string) => sql.includes('FOR UPDATE'));
    expect(lockCalls.some((sql: string) => sql.includes('FROM ruangan'))).toBe(
      true,
    );
    expect(
      lockCalls.some((sql: string) => sql.includes('FROM logistik') && !sql.includes('alokasi')),
    ).toBe(true);

    const inserts = connection.execute.mock.calls
      .map(([sql]: [string]) => sql)
      .filter((sql: string) => sql.includes('INSERT INTO alokasi_'));
    expect(inserts).toHaveLength(2);
  });

  it('rolls back and reports ROOM_CONFLICT when a room is already booked', async () => {
    const connection = createConnection();
    connection.execute.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM pengajuan_peminjaman p')) {
        return [[requestRow('WAITING_LOGISTIK')], []];
      }
      if (sql.includes('FROM paket_ruangan')) return [[{ id_ruangan: 3 }], []];
      if (sql.includes('FROM paket_logistik')) return [[], []];
      if (sql.includes('FROM ruangan WHERE id_ruangan')) {
        return [[{ id_ruangan: 3 }], []];
      }
      if (sql.includes('FROM alokasi_ruangan a')) {
        return [[{ nama_ruangan: 'Ruang Rapat UKM' }], []];
      }
      return [[], []];
    });

    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    const outcome = await repo.decide(7, 3, { keputusan: 'APPROVE' });

    expect(outcome).toMatchObject({
      outcome: 'UNAVAILABLE',
      issues: [{ type: 'ROOM_CONFLICT', nama_ruangan: 'Ruang Rapat UKM' }],
    });
    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.commit).not.toHaveBeenCalled();
  });

  it('reports STOCK_INSUFFICIENT with requested and available amounts', async () => {
    const connection = createConnection();
    connection.execute.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM pengajuan_peminjaman p')) {
        return [[requestRow('WAITING_LOGISTIK')], []];
      }
      if (sql.includes('FROM paket_ruangan')) return [[], []];
      if (sql.includes('FROM paket_logistik')) {
        return [[{ id_logistik: 1, jumlah: 5 }], []];
      }
      if (sql.includes('FROM logistik WHERE id_logistik')) {
        return [[{ id_logistik: 1 }], []];
      }
      if (sql.includes('FROM logistik l')) {
        return [[{ nama_logistik: 'Proyektor', stok_total: 3, terpakai: 0 }], []];
      }
      return [[], []];
    });

    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    const outcome = await repo.decide(7, 3, { keputusan: 'APPROVE' });

    expect(outcome).toMatchObject({
      outcome: 'UNAVAILABLE',
      issues: [
        {
          type: 'STOCK_INSUFFICIENT',
          nama_logistik: 'Proyektor',
          diminta: 5,
          tersedia: 3,
        },
      ],
    });
    expect(connection.rollback).toHaveBeenCalledOnce();
  });

  it('rejects a decision when the request is not pending Logistics', async () => {
    const connection = createConnection();
    connection.execute.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM pengajuan_peminjaman p')) {
        return [[requestRow('APPROVED_LOGISTIK')], []];
      }
      return [[], []];
    });

    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    const outcome = await repo.decide(7, 3, { keputusan: 'APPROVE' });

    expect(outcome).toEqual({
      outcome: 'NOT_PENDING',
      status: 'APPROVED_LOGISTIK',
    });
    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.execute).not.toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO keputusan_logistik'),
      expect.anything(),
    );
  });

  it('does not lock availability for REJECT', async () => {
    const connection = createConnection();
    connection.execute.mockImplementation(async (sql: string) => {
      if (sql.includes('FROM pengajuan_peminjaman p')) {
        return [[requestRow('WAITING_LOGISTIK')], []];
      }
      if (sql.includes('FROM paket_ruangan')) return [[{ id_ruangan: 3 }], []];
      if (sql.includes('FROM paket_logistik')) return [[], []];
      return [[], []];
    });

    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    const outcome = await repo.decide(7, 3, {
      keputusan: 'REJECT',
      alasan: 'Dokumen kurang',
    });

    expect(outcome).toMatchObject({ outcome: 'OK', status: 'REJECTED_LOGISTIK' });
    const lockCalls = connection.execute.mock.calls
      .map(([sql]: [string]) => sql)
      .filter((sql: string) => sql.includes('FROM ruangan WHERE id_ruangan'));
    expect(lockCalls).toHaveLength(0);
  });

  it('releases the connection when the transaction fails', async () => {
    const connection = createConnection();
    connection.execute.mockRejectedValue(new Error('deadlock'));
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new LogisticsRepository(pool as never);

    await expect(repo.decide(7, 3, { keputusan: 'APPROVE' })).rejects.toThrow(
      'deadlock',
    );
    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.release).toHaveBeenCalledOnce();
  });
});
