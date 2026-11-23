import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DetailKebutuhanFsk } from '../entities/fsk/detail-kebutuhan-fsk.entity.js';
import { SpesifikasiKebutuhan } from '../entities/fsk/spesifikasi-kebutuhan.entity.js';
import { FskService } from './fsk.service.js';

const user = { id: 1, email: 'mahasiswa@campus.ac.id', role: 'PEMINJAM' };

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

function fskRecord(idUser = 1) {
  return {
    fsk: SpesifikasiKebutuhan.fromRow({
      id_fsk: 1,
      id_user: idUser,
      nama_kegiatan: 'Seminar Nasional AI',
      tanggal_mulai: '2099-01-10',
      tanggal_selesai: '2099-01-10',
      waktu_mulai: '08:00',
      waktu_selesai: '17:00',
      jumlah_peserta: 100,
      tujuan_kegiatan: 'Meningkatkan literasi AI',
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
    ],
  };
}

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

describe('FskService', () => {
  it('creates a valid FSK for the current user', async () => {
    const repo = {
      create: vi.fn().mockResolvedValue(1),
      findById: vi.fn().mockResolvedValue(fskRecord()),
    };
    const service = new FskService(repo as never);

    const result = await service.create(validDto, user);

    expect(repo.create).toHaveBeenCalledWith(1, validDto);
    expect(result.message).toBe('Detail FSK');
    expect(result.data).toMatchObject({
      id_fsk: 1,
      status: 'DRAFT',
      detail_kebutuhan: [{ kategori: 'RUANGAN', jumlah: 1 }],
    });
  });

  it('rejects a non-positive participant count', async () => {
    const repo = { create: vi.fn(), findById: vi.fn() };
    const service = new FskService(repo as never);

    await expectBusinessCode(
      service.create({ ...validDto, jumlah_peserta: 0 }, user),
      'FSK_INVALID_CAPACITY',
    );
    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects a schedule that ends before it starts', async () => {
    const repo = { create: vi.fn(), findById: vi.fn() };
    const service = new FskService(repo as never);

    await expectBusinessCode(
      service.create(
        {
          ...validDto,
          tanggal_mulai: '2099-01-12',
          tanggal_selesai: '2099-01-10',
        },
        user,
      ),
      'FSK_INVALID_SCHEDULE',
    );
  });

  it('rejects a schedule in the past', async () => {
    const repo = { create: vi.fn(), findById: vi.fn() };
    const service = new FskService(repo as never);

    await expectBusinessCode(
      service.create(
        {
          ...validDto,
          tanggal_mulai: '2020-01-10',
          tanggal_selesai: '2020-01-11',
        },
        user,
      ),
      'FSK_INVALID_SCHEDULE',
    );
  });

  it('rejects a detail with a non-positive quantity', async () => {
    const repo = { create: vi.fn(), findById: vi.fn() };
    const service = new FskService(repo as never);

    await expectBusinessCode(
      service.create(
        {
          ...validDto,
          detail_kebutuhan: [
            { kategori: 'LOGISTIK', jenis_kebutuhan: 'Proyektor', jumlah: 0 },
          ],
        },
        user,
      ),
      'FSK_INVALID_DETAIL',
    );
  });

  it('updates an FSK owned by the current user using merged values', async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(fskRecord()),
      update: vi.fn().mockResolvedValue(undefined),
    };
    const service = new FskService(repo as never);

    await service.update(1, { nama_kegiatan: 'Seminar Revisi' }, user);

    expect(repo.update).toHaveBeenCalledWith(1, { nama_kegiatan: 'Seminar Revisi' });
    expect(repo.findById).toHaveBeenCalledTimes(2);
  });

  it('does not expose an FSK owned by another user', async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(fskRecord(2)),
      update: vi.fn(),
    };
    const service = new FskService(repo as never);

    await expect(
      service.update(1, { nama_kegiatan: 'Seminar Revisi' }, user),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(repo.update).not.toHaveBeenCalled();
  });
});
