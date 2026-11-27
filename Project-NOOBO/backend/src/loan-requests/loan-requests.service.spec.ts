import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { DetailKebutuhanFsk } from '../entities/fsk/detail-kebutuhan-fsk.entity.js';
import { SpesifikasiKebutuhan } from '../entities/fsk/spesifikasi-kebutuhan.entity.js';
import { AturanPeminjaman } from '../entities/workflow/aturan-peminjaman.entity.js';
import { Pembina } from '../entities/workflow/pembina.entity.js';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';
import { LoanRequestsService } from './loan-requests.service.js';

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
  ],
};

const selectedPackage = {
  id_paket: 5,
  id_fsk: 1,
  nama_paket: 'Paket Auditorium',
  skor: 95,
  alasan: 'Kapasitas sesuai',
  snapshot: null,
  dipilih: true,
  dibuat_pada: new Date(),
  ruangan: { id_ruangan: 1, nama_ruangan: 'Auditorium' },
  logistik: [],
};

const rule = AturanPeminjaman.fromRow({
  id_aturan: 1,
  nama_aturan: 'Ketentuan Umum',
  deskripsi: 'Dasar',
  ketentuan: 'Wajib menjaga fasilitas',
  aktif: 1,
});

const pembina = Pembina.fromRow({
  id_pembina: 2,
  nama_pembina: 'Dr. Budi',
  email_pembina: 'pembina@campus.ac.id',
  status_aktif: 1,
});

const loanRequest = (status: string) =>
  PengajuanPeminjaman.fromRow({
    id_pengajuan: 10,
    id_fsk: 1,
    id_paket: 5,
    id_pembina: 2,
    email_pembina: 'pembina@campus.ac.id',
    id_aturan: 1,
    setuju_syarat: 1,
    waktu_setuju: new Date(),
    nomor_pengajuan: 'FPP-20260101-ABCD1234',
    tanggal_pengajuan: new Date(),
    status,
    catatan: null,
  });

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
  const recommendations = {
    findByFsk: vi.fn().mockResolvedValue([selectedPackage]),
  };
  const repository = {
    findActiveRule: vi.fn().mockResolvedValue(rule),
    findPembina: vi.fn().mockResolvedValue(pembina),
    findActiveByFsk: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({
      id_pengajuan: 10,
      nomor_pengajuan: 'FPP-20260101-ABCD1234',
      token_kedaluwarsa_pada: new Date(Date.now() + 48 * 60 * 60 * 1000),
    }),
    cancel: vi.fn().mockResolvedValue({
      outcome: 'CANCELLED',
      request: loanRequest('CANCELLED'),
    }),
    findMany: vi.fn().mockResolvedValue({
      rows: [
        {
          id_pengajuan: 10,
          nomor_pengajuan: 'FPP-20260101-ABCD1234',
          id_fsk: 1,
          id_paket: 5,
          status: 'COMPLETED',
          nama_kegiatan: 'Seminar',
          tanggal_mulai: '2026-11-10',
          tanggal_selesai: '2026-11-10',
          waktu_mulai: '08:00',
          waktu_selesai: '12:00',
          jumlah_peserta: 50,
          tujuan_kegiatan: 'Belajar',
          borrower_nama: 'Aria',
          borrower_email: 'mahasiswa@campus.ac.id',
          nomor_sbp: 'SBP-2026-0001',
          id_sbpg: 9,
          status_ketepatan_waktu: 'TEPAT_WAKTU',
        },
      ],
      total: 1,
    }),
    findPackageLines: vi.fn().mockResolvedValue({ room: null, logistics: [] }),
    listHistory: vi.fn().mockResolvedValue([
      {
        from_status: 'RETURN_REPORTED',
        to_status: 'COMPLETED',
        actor_type: 'LOGISTIK',
        actor_id: 3,
        note: 'Lengkap',
        at: '2026-11-10T13:00:00Z',
      },
    ]),
    listReturnDetails: vi.fn().mockResolvedValue([
      {
        id_detail_pengembalian: 1,
        jumlah_dikembalikan: 1,
        kondisi_kembali: 'Baik',
      },
    ]),
  };
  const emailService = {
    send: vi.fn().mockResolvedValue({ status: 'SENT' }),
  };
  const config = {
    get: vi.fn((key: string) => {
      if (key === 'APPROVAL_TOKEN_TTL_HOURS') return 48;
      if (key === 'APP_URL') return 'http://localhost:3000';
      return undefined;
    }),
  };

  const service = new LoanRequestsService(
    fskService as never,
    recommendations as never,
    repository as never,
    emailService as never,
    config as never,
  );

  return { fskService, recommendations, repository, emailService, service };
}

const validDto = { id_fsk: 1, id_pembina: 2, setuju_syarat: true };

describe('LoanRequestsService', () => {
  it('creates a request, stores only the token hash, and queues the Pembina email', async () => {
    const { repository, emailService, service } = setup();

    const result = await service.create(validDto, user);

    expect(repository.create).toHaveBeenCalledOnce();
    const input = repository.create.mock.calls[0][0];
    expect(input.token_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(input.email_pembina).toBe('pembina@campus.ac.id');
    expect(input.id_paket).toBe(5);
    expect(emailService.send).toHaveBeenCalledOnce();
    expect(emailService.send.mock.calls[0][0]).toMatchObject({
      to_email: 'pembina@campus.ac.id',
      template: 'PEMBINA_APPROVAL_REQUEST',
    });
    expect(result.data.status).toBe('WAITING_PEMBINA');
    expect(result.data.email_status).toBe('SENT');
    expect(result.data).not.toHaveProperty('token');
  });

  it('returns the draft with the selected package and active rule', async () => {
    const { service } = setup();

    const result = await service.draft(1, user);

    expect(result.data.paket).toEqual(selectedPackage);
    expect(result.data.aturan).toMatchObject({ id_aturan: 1 });
  });

  it('rejects submission when terms are not accepted', async () => {
    const { repository, service } = setup();

    await expectBusinessCode(
      service.create({ ...validDto, setuju_syarat: false }, user),
      'TERMS_NOT_ACCEPTED',
    );
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects submission when no package has been selected', async () => {
    const { recommendations, repository, service } = setup();
    recommendations.findByFsk.mockResolvedValue([]);

    await expectBusinessCode(service.create(validDto, user), 'PACKAGE_NOT_SELECTED');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects submission when the FSK already has an active request', async () => {
    const { repository, service } = setup();
    repository.findActiveByFsk.mockResolvedValue(loanRequest('WAITING_PEMBINA'));

    await expectBusinessCode(service.create(validDto, user), 'LOAN_REQUEST_EXISTS');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects submission when the chosen Pembina is inactive', async () => {
    const { repository, service } = setup();
    repository.findPembina.mockResolvedValue(
      Pembina.fromRow({
        id_pembina: 2,
        nama_pembina: 'Dr. Budi',
        email_pembina: 'pembina@campus.ac.id',
        status_aktif: 0,
      }),
    );

    await expectBusinessCode(service.create(validDto, user), 'PEMBINA_INACTIVE');
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rejects submission when the Pembina does not exist', async () => {
    const { repository, service } = setup();
    repository.findPembina.mockResolvedValue(null);

    await expect(service.create(validDto, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('cancels a pending request', async () => {
    const { repository, service } = setup();

    const result = await service.cancel(10, { catatan: 'Batal' }, user);

    expect(repository.cancel).toHaveBeenCalledWith(10, 1, 'Batal');
    expect(result.data.status).toBe('CANCELLED');
  });

  it('rejects cancellation after the Logistics decision', async () => {
    const { repository, service } = setup();
    repository.cancel.mockResolvedValue({
      outcome: 'NOT_CANCELLABLE',
      status: 'APPROVED_LOGISTIK',
    });

    await expectBusinessCode(
      service.cancel(10, {}, user),
      'LOAN_REQUEST_NOT_CANCELLABLE',
    );
  });

  it('hides requests owned by another user', async () => {
    const { repository, service } = setup();
    repository.cancel.mockResolvedValue({ outcome: 'NOT_OWNER' });

    await expect(service.cancel(10, {}, user)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('scopes historyList to own requests for PEMINJAM and all requests for LOGISTIK (FR-24, UC-19)', async () => {
    const { repository, service } = setup();

    const peminjamRes = await service.historyList(
      { page: 1, limit: 10, status: 'COMPLETED', from: '2026-11-01', to: '2026-11-30' },
      user,
    );
    expect(repository.findMany).toHaveBeenCalledWith({
      status: 'COMPLETED',
      idUser: 1,
      from: '2026-11-01',
      to: '2026-11-30',
      q: undefined,
      page: 1,
      limit: 10,
    });
    expect(peminjamRes.data[0]).toMatchObject({
      id_pengajuan: 10,
      status_code: 'COMPLETED',
      sbpPublished: true,
      returned: true,
    });
    expect((peminjamRes.data[0] as { history: unknown[] }).history).toHaveLength(1);

    const logistikUser = { id: 3, email: 'logistik@campus.ac.id', role: 'LOGISTIK' };
    await service.historyList({ page: 1, limit: 10, q: 'Seminar' }, logistikUser);
    expect(repository.findMany).toHaveBeenLastCalledWith({
      status: undefined,
      idUser: null,
      from: undefined,
      to: undefined,
      q: 'Seminar',
      page: 1,
      limit: 10,
    });
  });
});
