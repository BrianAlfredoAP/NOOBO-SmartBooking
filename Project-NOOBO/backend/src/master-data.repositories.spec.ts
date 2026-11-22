import { describe, it, expect, vi } from 'vitest';
import { RoomsRepository } from './rooms/rooms.repository.js';
import { LogisticItemsRepository } from './logistic-items/logistic-items.repository.js';
import { PembinaRepository } from './pembina/pembina.repository.js';
import { LoanRulesRepository } from './loan-rules/loan-rules.repository.js';

describe('Master data repositories (mock pool)', () => {
  it('RoomsRepository maps rows, paginates and checks active allocation', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([[{ total: 1 }], []])
      .mockResolvedValueOnce([
        [
          {
            id_ruangan: 3,
            nama_ruangan: 'Ruang A',
            jenis: 'Ruang Seminar',
            lokasi: 'Gedung B',
            kapasitas: 80,
            kondisi_fasilitas: 'Baik',
            status_aktif: 1,
          },
        ],
        [],
      ]);
    const repo = new RoomsRepository({ execute } as never);

    const result = await repo.findAll({ page: 2, limit: 5, q: 'A', status_aktif: true } as never);

    expect(execute.mock.calls[1][1]).toEqual(['%A%', '%A%', true, 5, 5]);
    expect(result.total).toBe(1);
    expect(result.items[0].nama_ruangan).toBe('Ruang A');
    expect(result.items[0].status_aktif).toBe(true);

    execute.mockResolvedValue([[{ 1: 1 }], []]);
    expect(await repo.hasActiveAllocation(3)).toBe(true);
    expect(execute).toHaveBeenLastCalledWith(
      expect.stringContaining("status_alokasi NOT IN ('RELEASED', 'CANCELLED')"),
      [3],
    );
  });

  it('LogisticItemsRepository maps rows and checks name uniqueness', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([[{ total: 1 }], []])
      .mockResolvedValueOnce([
        [
          {
            id_logistik: 1,
            nama_logistik: 'Proyektor',
            jenis: 'Elektronik',
            stok_total: 15,
            kondisi_fasilitas: 'Baik',
            status_aktif: 1,
          },
        ],
        [],
      ]);
    const repo = new LogisticItemsRepository({ execute } as never);

    const result = await repo.findAll({ page: 1, limit: 10 } as never);
    expect(result.items[0].stok_total).toBe(15);

    execute.mockResolvedValue([[], []]);
    expect(await repo.findByName('Proyektor')).toBe(false);
    expect(execute).toHaveBeenLastCalledWith(expect.stringContaining('nama_logistik = ?'), [
      'Proyektor',
      0,
    ]);
  });

  it('PembinaRepository maps rows and protects active requests', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([[{ total: 0 }], []])
      .mockResolvedValueOnce([[], []]);
    const repo = new PembinaRepository({ execute } as never);

    const result = await repo.findAll({ page: 1, limit: 10 } as never);
    expect(result).toEqual({ items: [], total: 0 });

    execute.mockResolvedValue([[{ 1: 1 }], []]);
    expect(await repo.hasActiveRequest(2)).toBe(true);
    expect(execute).toHaveBeenLastCalledWith(
      expect.stringContaining('id_pembina = ?'),
      expect.arrayContaining([2, 'COMPLETED']),
    );
  });

  it('LoanRulesRepository maps rows and protects active requests', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([[{ total: 1 }], []])
      .mockResolvedValueOnce([
        [
          {
            id_aturan: 1,
            nama_aturan: 'Aturan Umum',
            deskripsi: null,
            ketentuan: 'Wajib lapor',
            aktif: 1,
          },
        ],
        [],
      ]);
    const repo = new LoanRulesRepository({ execute } as never);

    const result = await repo.findAll({ page: 1, limit: 10, aktif: true } as never);
    expect(result.items[0].aktif).toBe(true);
    expect(result.items[0].deskripsi).toBe('');
    expect(execute.mock.calls[0][1]).toEqual([true]);
  });
});
