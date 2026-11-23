import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DetailKebutuhanFsk } from '../entities/fsk/detail-kebutuhan-fsk.entity.js';
import { SpesifikasiKebutuhan } from '../entities/fsk/spesifikasi-kebutuhan.entity.js';
import { Logistik } from '../entities/logistics/logistik.entity.js';
import { Ruangan } from '../entities/logistics/ruangan.entity.js';
import { RecommendationsService } from './recommendations.service.js';

const user = { id: 1, email: 'mahasiswa@campus.ac.id', role: 'PEMINJAM' };

const fskRecord = {
  fsk: SpesifikasiKebutuhan.fromRow({
    id_fsk: 1,
    id_user: 1,
    nama_kegiatan: 'Seminar',
    tanggal_mulai: '2099-01-10',
    tanggal_selesai: '2099-01-10',
    waktu_mulai: '08:00',
    waktu_selesai: '17:00',
    jumlah_peserta: 100,
    tujuan_kegiatan: 'Belajar',
    status: 'DRAFT',
    created_at: '2099-01-01',
  }),
  details: [
    DetailKebutuhanFsk.fromRow({
      id_detail_kebutuhan: 1,
      id_fsk: 1,
      kategori: 'RUANGAN',
      jenis_kebutuhan: 'Auditorium',
      jumlah: 1,
      keterangan: null,
    }),
    DetailKebutuhanFsk.fromRow({
      id_detail_kebutuhan: 2,
      id_fsk: 1,
      kategori: 'LOGISTIK',
      jenis_kebutuhan: 'Proyektor',
      jumlah: 2,
      keterangan: null,
    }),
  ],
};

const room = (id: number, kapasitas: number) =>
  Ruangan.fromRow({
    id_ruangan: id,
    nama_ruangan: `Room ${id}`,
    jenis: 'Auditorium',
    lokasi: 'Gedung A',
    kapasitas,
    kondisi_fasilitas: 'Baik',
    status_aktif: 1,
  });

const proyektor = Logistik.fromRow({
  id_logistik: 1,
  nama_logistik: 'Proyektor',
  jenis: 'Elektronik',
  stok_total: 10,
  kondisi_fasilitas: 'Baik',
  status_aktif: 1,
});

const packageView = {
  id_paket: 1,
  id_fsk: 1,
  nama_paket: 'Paket Room 1',
  skor: 92.5,
  alasan: 'Kapasitas 100 untuk 100 peserta',
  snapshot: null,
  dipilih: true,
  dibuat_pada: new Date(),
  ruangan: { id_ruangan: 1, nama_ruangan: 'Room 1' },
  logistik: [
    { id_logistik: 1, nama_logistik: 'Proyektor', jumlah: 2 },
  ],
};

async function expectBusinessCode(
  promise: Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected BusinessException');
  } catch (error) {
    expect(error).toMatchObject({ code });
  }
}

function setup() {
  const fskService = { findOwned: vi.fn().mockResolvedValue(fskRecord) };
  const availability = {
    checkRoomConflict: vi.fn().mockResolvedValue(false),
    availableStock: vi.fn().mockResolvedValue(10),
  };
  const repo = {
    findLogisticCandidates: vi.fn().mockResolvedValue([proyektor]),
    findCandidateRooms: vi
      .fn()
      .mockResolvedValue([room(1, 100), room(2, 200), room(3, 400)]),
    replacePackages: vi.fn().mockResolvedValue(undefined),
    findByFsk: vi.fn().mockResolvedValue([packageView]),
    findById: vi.fn().mockResolvedValue(packageView),
    markSelected: vi.fn().mockResolvedValue(undefined),
  };
  const service = new RecommendationsService(
    fskService as never,
    availability as never,
    repo as never,
  );
  return { fskService, availability, repo, service };
}

describe('RecommendationsService', () => {
  it('builds at most three packages sorted by score with factual reasons', async () => {
    const { repo, service } = setup();

    const result = await service.generate(1, user);

    expect(repo.replacePackages).toHaveBeenCalledOnce();
    const drafts = repo.replacePackages.mock.calls[0][1];
    expect(drafts).toHaveLength(3);
    expect(drafts.map((draft: { id_ruangan: number }) => draft.id_ruangan)).toEqual([1, 2, 3]);
    expect(drafts[0].alasan).toContain('Kapasitas 100 untuk 100 peserta');
    expect(drafts[0].alasan).toContain(
      'Stok Proyektor 10 tersedia untuk kebutuhan 2',
    );
    expect(drafts[0].logistik).toEqual([{ id_logistik: 1, jumlah: 2 }]);
    expect(result.data).toEqual([packageView]);
  });

  it('returns NO_PACKAGE_AVAILABLE when no item has enough stock', async () => {
    const { repo, service } = setup();
    repo.findLogisticCandidates.mockResolvedValue([]);

    await expectBusinessCode(service.generate(1, user), 'NO_PACKAGE_AVAILABLE');
    expect(repo.replacePackages).not.toHaveBeenCalled();
  });

  it('returns NO_PACKAGE_AVAILABLE when every room is already booked', async () => {
    const { availability, repo, service } = setup();
    availability.checkRoomConflict.mockResolvedValue(true);

    await expectBusinessCode(service.generate(1, user), 'NO_PACKAGE_AVAILABLE');
    expect(repo.replacePackages).not.toHaveBeenCalled();
  });

  it('marks a package as selected after the availability recheck', async () => {
    const { repo, service } = setup();

    const result = await service.select(1, 1, user);

    expect(repo.markSelected).toHaveBeenCalledWith(1, 1);
    expect(result.message).toBe('Paket dipilih');
  });

  it('rejects selection when stock changed since the recommendation', async () => {
    const { availability, repo, service } = setup();
    availability.availableStock.mockResolvedValue(1);

    await expectBusinessCode(
      service.select(1, 1, user),
      'PACKAGE_UNAVAILABLE',
    );
    expect(repo.markSelected).not.toHaveBeenCalled();
  });

  it('rejects selection when the room is no longer free', async () => {
    const { availability, repo, service } = setup();
    availability.checkRoomConflict.mockResolvedValue(true);

    await expectBusinessCode(
      service.select(1, 1, user),
      'PACKAGE_UNAVAILABLE',
    );
    expect(repo.markSelected).not.toHaveBeenCalled();
  });

  it('rejects a package that does not belong to the FSK', async () => {
    const { repo, service } = setup();
    repo.findById.mockResolvedValue(null);

    await expect(service.select(1, 99, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
