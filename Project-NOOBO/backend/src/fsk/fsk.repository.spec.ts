import { describe, expect, it, vi } from 'vitest';
import { FskRepository } from './fsk.repository.js';

const validDto = {
  nama_kegiatan: 'Seminar Nasional AI',
  tanggal_mulai: '2099-01-10',
  tanggal_selesai: '2099-01-10',
  waktu_mulai: '08:00',
  waktu_selesai: '17:00',
  jumlah_peserta: 100,
  tujuan_kegiatan: 'Meningkatkan literasi AI',
  detail_kebutuhan: [
    { kategori: 'RUANGAN', jenis_kebutuhan: 'Auditorium', jumlah: 1 },
    { kategori: 'LOGISTIK', jenis_kebutuhan: 'Proyektor', jumlah: 2 },
  ],
};

function createConnection(execute: ReturnType<typeof vi.fn>) {
  return {
    execute,
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    release: vi.fn(),
  };
}

describe('FskRepository', () => {
  it('inserts the FSK and its details inside a transaction', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([{ insertId: 7 }, []])
      .mockResolvedValue([{ insertId: 1 }, []]);
    const connection = createConnection(execute);
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new FskRepository(pool as never);

    const id = await repo.create(1, validDto);

    expect(id).toBe(7);
    expect(execute.mock.calls[0][0]).toContain(
      'INSERT INTO spesifikasi_kebutuhan',
    );
    expect(execute.mock.calls[0][1]).toEqual([
      1,
      'Seminar Nasional AI',
      '2099-01-10',
      '2099-01-10',
      '08:00',
      '17:00',
      100,
      'Meningkatkan literasi AI',
    ]);
    expect(execute.mock.calls[1][0]).toContain(
      'INSERT INTO detail_kebutuhan_fsk',
    );
    expect(execute.mock.calls[2][1]).toEqual([
      7,
      'LOGISTIK',
      'Proyektor',
      2,
      null,
    ]);
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it('rolls back and releases the connection when an insert fails', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([{ insertId: 7 }, []])
      .mockRejectedValueOnce(new Error('boom'));
    const connection = createConnection(execute);
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new FskRepository(pool as never);

    await expect(repo.create(1, validDto)).rejects.toThrow('boom');

    expect(connection.rollback).toHaveBeenCalledOnce();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it('replaces details when an update includes them', async () => {
    const execute = vi.fn().mockResolvedValue([{ affectedRows: 1 }, []]);
    const connection = createConnection(execute);
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new FskRepository(pool as never);

    await repo.update(5, { detail_kebutuhan: [validDto.detail_kebutuhan[0]] });

    expect(execute.mock.calls[0][0]).toContain('UPDATE spesifikasi_kebutuhan');
    expect(execute.mock.calls[1][0]).toContain('DELETE FROM detail_kebutuhan_fsk');
    expect(execute.mock.calls[2][0]).toContain('INSERT INTO detail_kebutuhan_fsk');
    expect(connection.commit).toHaveBeenCalledOnce();
  });

  it('maps the FSK row and its details', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([
        [
          {
            id_fsk: 3,
            id_user: 1,
            nama_kegiatan: 'Seminar',
            tanggal_mulai: '2099-01-10',
            tanggal_selesai: '2099-01-11',
            waktu_mulai: '08:00',
            waktu_selesai: '17:00',
            jumlah_peserta: 80,
            tujuan_kegiatan: 'Belajar',
            status: 'DRAFT',
            created_at: '2099-01-01',
          },
        ],
        [],
      ])
      .mockResolvedValueOnce([
        [
          {
            id_detail_kebutuhan: 9,
            id_fsk: 3,
            kategori: 'RUANGAN',
            jenis_kebutuhan: 'Ruang Seminar',
            jumlah: 1,
            keterangan: null,
          },
        ],
        [],
      ]);
    const repo = new FskRepository({ execute } as never);

    const record = await repo.findById(3);

    expect(record?.fsk.id_fsk).toBe(3);
    expect(record?.fsk.validate()).toBe(true);
    expect(record?.details[0].viewDetail()).toMatchObject({
      id_detail_kebutuhan: 9,
      keterangan: '',
    });
  });
});
