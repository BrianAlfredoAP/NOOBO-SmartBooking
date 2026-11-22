import { describe, expect, it, vi } from 'vitest';
import { RecommendationsRepository } from './recommendations.repository.js';

const roomRow = {
  id_ruangan: 1,
  nama_ruangan: 'Auditorium',
  jenis: 'Auditorium',
  lokasi: 'Gedung A',
  kapasitas: 350,
  kondisi_fasilitas: 'Sangat Baik',
  status_aktif: 1,
};

const logisticRow = {
  id_logistik: 1,
  nama_logistik: 'Proyektor',
  jenis: 'Elektronik',
  stok_total: 15,
  kondisi_fasilitas: 'Baik',
  status_aktif: 1,
};

describe('RecommendationsRepository', () => {
  it('filters candidate rooms by capacity, condition and requested type', async () => {
    const execute = vi.fn().mockResolvedValue([[roomRow], []]);
    const repo = new RecommendationsRepository({ execute } as never);

    const rooms = await repo.findCandidateRooms(100, 'Auditorium');

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('kapasitas >= ?'),
      [100, 'Auditorium', '%Auditorium%'],
    );
    expect(rooms[0].nama_ruangan).toBe('Auditorium');
  });

  it('filters logistics candidates by name or type', async () => {
    const execute = vi.fn().mockResolvedValue([[logisticRow], []]);
    const repo = new RecommendationsRepository({ execute } as never);

    const items = await repo.findLogisticCandidates('Proyektor');

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('nama_logistik LIKE ?'),
      ['%Proyektor%', 'Proyektor'],
    );
    expect(items[0].stok_total).toBe(15);
  });

  it('replaces packages and their rooms/logistics in a transaction', async () => {
    const execute = vi.fn().mockResolvedValue([{ insertId: 7 }, []]);
    const connection = {
      execute,
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    };
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new RecommendationsRepository(pool as never);

    await repo.replacePackages(3, [
      {
        nama_paket: 'Paket Auditorium',
        skor: 90,
        alasan: 'Kapasitas cukup',
        snapshot: { ruangan: { id_ruangan: 1 } },
        id_ruangan: 1,
        logistik: [{ id_logistik: 1, jumlah: 2 }],
      },
    ]);

    const sqls = execute.mock.calls.map((call) => String(call[0]));
    expect(sqls[0]).toContain('DELETE FROM paket_rekomendasi');
    expect(sqls[1]).toContain('INSERT INTO paket_rekomendasi');
    expect(sqls[2]).toContain('INSERT INTO paket_ruangan');
    expect(sqls[3]).toContain('INSERT INTO paket_logistik');
    expect(execute.mock.calls[1][1][4]).toBe('{"ruangan":{"id_ruangan":1}}');
    expect(connection.commit).toHaveBeenCalledOnce();
    expect(connection.release).toHaveBeenCalledOnce();
  });

  it('hydrates a package with its room and logistics', async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce([
        [
          {
            id_paket: 1,
            id_fsk: 3,
            nama_paket: 'Paket Auditorium',
            skor: '92.50',
            alasan: 'Kapasitas cukup',
            snapshot: '{"ruangan":{"id_ruangan":1}}',
            dipilih: 1,
            dibuat_pada: '2099-01-01',
          },
        ],
        [],
      ])
      .mockResolvedValueOnce([[roomRow], []])
      .mockResolvedValueOnce([[{ ...logisticRow, jumlah: 2 }], []]);
    const repo = new RecommendationsRepository({ execute } as never);

    const packages = await repo.findByFsk(3);

    expect(packages[0]).toMatchObject({
      id_paket: 1,
      skor: 92.5,
      dipilih: true,
      snapshot: { ruangan: { id_ruangan: 1 } },
    });
    expect(packages[0].ruangan?.id_ruangan).toBe(1);
    expect(packages[0].logistik[0]).toMatchObject({
      id_logistik: 1,
      jumlah: 2,
    });
  });

  it('marks exactly one package as selected', async () => {
    const execute = vi.fn().mockResolvedValue([{ affectedRows: 1 }, []]);
    const connection = {
      execute,
      beginTransaction: vi.fn(),
      commit: vi.fn(),
      rollback: vi.fn(),
      release: vi.fn(),
    };
    const pool = { getConnection: vi.fn().mockResolvedValue(connection) };
    const repo = new RecommendationsRepository(pool as never);

    await repo.markSelected(3, 7);

    expect(execute.mock.calls[0][0]).toContain('SET dipilih = FALSE');
    expect(execute.mock.calls[1][0]).toContain('SET dipilih = TRUE');
    expect(execute.mock.calls[1][1]).toEqual([3, 7]);
    expect(connection.commit).toHaveBeenCalledOnce();
  });
});
