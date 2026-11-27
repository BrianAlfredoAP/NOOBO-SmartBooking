import { describe, expect, it, vi } from 'vitest';
import { LoanRequestsRepository } from '../loan-requests/loan-requests.repository.js';
import { MeService } from './me.service.js';

const peminjam = { id: 1, email: 'mahasiswa@campus.ac.id', role: 'PEMINJAM' };

describe('Sprint 6 Tahap 1 — SBPG submission & retrieval (FR-20, FR-21, UC-17)', () => {
  it('marks SBPG as TEPAT_WAKTU when submitted within 60 minutes after event end', async () => {
    const futureEnd = new Date(Date.now() + 30 * 60 * 1000);
    const yyyy = futureEnd.getFullYear();
    const mm = String(futureEnd.getMonth() + 1).padStart(2, '0');
    const dd = String(futureEnd.getDate()).padStart(2, '0');
    const hh = String(futureEnd.getHours()).padStart(2, '0');
    const min = String(futureEnd.getMinutes()).padStart(2, '0');

    const execute = vi.fn(async (sql: string) => {
      if (sql.includes('FOR UPDATE')) {
        return [
          [
            {
              id_pengajuan: 7,
              id_user: 1,
              status: 'ONGOING',
              tanggal_selesai: `${yyyy}-${mm}-${dd}`,
              waktu_selesai: `${hh}:${min}`,
            },
          ],
          [],
        ];
      }
      if (sql.includes('FROM alokasi_ruangan')) {
        return [[{ id_alokasi_ruangan: 10 }], []];
      }
      if (sql.includes('FROM alokasi_logistik')) {
        return [[{ id_alokasi_logistik: 20, jumlah_dialokasikan: 3 }], []];
      }
      if (sql.includes('INSERT INTO sbpg')) {
        return [{ insertId: 55 }, []];
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
    const pool = {
      execute,
      getConnection: vi.fn().mockResolvedValue(connection),
    };

    const repository = new LoanRequestsRepository(pool as never);
    const service = new MeService(repository);

    const res = await service.submitSbpg(
      7,
      {
        catatan: 'Semua lengkap',
        items: [
          {
            id_alokasi_logistik: 20,
            jumlah_dikembalikan: 3,
            kondisi_kembali: 'Baik',
          },
          {
            id_alokasi_ruangan: 10,
            jumlah_dikembalikan: 1,
            kondisi_kembali: 'Baik',
          },
        ],
      },
      peminjam,
    );

    expect(res.data).toMatchObject({
      id_sbpg: 55,
      status: 'RETURN_REPORTED',
      status_ketepatan_waktu: 'TEPAT_WAKTU',
      is_late: false,
    });
    expect(connection.commit).toHaveBeenCalledTimes(1);
  });

  it('marks SBPG as TERLAMBAT (is_late=true) when submitted > 60 minutes after event end', async () => {
    const execute = vi.fn(async (sql: string) => {
      if (sql.includes('FOR UPDATE')) {
        return [
          [
            {
              id_pengajuan: 7,
              id_user: 1,
              status: 'ONGOING',
              tanggal_selesai: '2025-01-01',
              waktu_selesai: '10:00',
            },
          ],
          [],
        ];
      }
      if (sql.includes('FROM alokasi_ruangan')) return [[], []];
      if (sql.includes('FROM alokasi_logistik')) {
        return [[{ id_alokasi_logistik: 20, jumlah_dialokasikan: 2 }], []];
      }
      if (sql.includes('INSERT INTO sbpg')) return [{ insertId: 56 }, []];
      return [{ affectedRows: 1 }, []];
    });

    const connection = {
      execute,
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };
    const repository = new LoanRequestsRepository({
      execute,
      getConnection: vi.fn().mockResolvedValue(connection),
    } as never);
    const service = new MeService(repository);

    const res = await service.submitSbpg(
      7,
      {
        items: [
          {
            id_alokasi_logistik: 20,
            jumlah_dikembalikan: 2,
            kondisi_kembali: 'Baik',
          },
        ],
      },
      peminjam,
    );

    expect(res.data).toMatchObject({
      id_sbpg: 56,
      status: 'RETURN_REPORTED',
      status_ketepatan_waktu: 'TERLAMBAT',
      is_late: true,
    });
  });

  it('rejects with SBPG_INVALID_ITEM when returnedQty exceeds borrowedQty', async () => {
    const execute = vi.fn(async (sql: string) => {
      if (sql.includes('FOR UPDATE')) {
        return [
          [
            {
              id_pengajuan: 7,
              id_user: 1,
              status: 'ONGOING',
              tanggal_selesai: '2026-11-27',
              waktu_selesai: '15:00',
            },
          ],
          [],
        ];
      }
      if (sql.includes('FROM alokasi_ruangan')) return [[], []];
      if (sql.includes('FROM alokasi_logistik')) {
        return [[{ id_alokasi_logistik: 20, jumlah_dialokasikan: 2 }], []];
      }
      return [[], []];
    });

    const connection = {
      execute,
      beginTransaction: vi.fn().mockResolvedValue(undefined),
      commit: vi.fn().mockResolvedValue(undefined),
      rollback: vi.fn().mockResolvedValue(undefined),
      release: vi.fn(),
    };
    const repository = new LoanRequestsRepository({
      execute,
      getConnection: vi.fn().mockResolvedValue(connection),
    } as never);
    const service = new MeService(repository);

    await expect(
      service.submitSbpg(
        7,
        {
          items: [
            {
              id_alokasi_logistik: 20,
              jumlah_dikembalikan: 5,
              kondisi_kembali: 'Baik',
            },
          ],
        },
        peminjam,
      ),
    ).rejects.toMatchObject({
      code: 'SBPG_INVALID_ITEM',
    });
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
  });

  it('throws DOCUMENT_NOT_AVAILABLE on getSbpg when SBPG has not been submitted', async () => {
    const repository = {
      findDetail: vi.fn().mockResolvedValue({
        id_pengajuan: 7,
        id_user: 1,
        nomor_pengajuan: 'FPP-20261127-1111',
        nama_kegiatan: 'Seminar AI',
        id_sbpg: null,
      }),
    };
    const service = new MeService(repository as never);

    await expect(service.getSbpg(7, peminjam)).rejects.toMatchObject({
      code: 'DOCUMENT_NOT_AVAILABLE',
    });
  });

  it('returns SBPG details and items when SBPG exists', async () => {
    const repository = {
      findDetail: vi.fn().mockResolvedValue({
        id_pengajuan: 7,
        id_user: 1,
        nomor_pengajuan: 'FPP-20261127-1111',
        nama_kegiatan: 'Seminar AI',
        id_sbpg: 55,
        waktu_kirim: '2026-11-27T16:10:00.000Z',
        batas_waktu_kirim: '2026-11-27T16:00:00.000Z',
        status_ketepatan_waktu: 'TERLAMBAT',
        catatan_peminjam: 'Kabel HDMI tertukar',
      }),
      listReturnDetails: vi.fn().mockResolvedValue([
        {
          id_detail_pengembalian: 1,
          id_alokasi_logistik: 20,
          nama_logistik: 'Proyektor',
          jumlah_dipinjam: 2,
          jumlah_dikembalikan: 2,
          kondisi_kembali: 'Baik',
        },
      ]),
    };
    const service = new MeService(repository as never);

    const res = await service.getSbpg(7, peminjam);
    expect(res.data).toMatchObject({
      id_sbpg: 55,
      id_pengajuan: 7,
      status_ketepatan_waktu: 'TERLAMBAT',
      is_late: true,
      catatan_peminjam: 'Kabel HDMI tertukar',
    });
    expect(res.data.items).toHaveLength(1);
  });
});
