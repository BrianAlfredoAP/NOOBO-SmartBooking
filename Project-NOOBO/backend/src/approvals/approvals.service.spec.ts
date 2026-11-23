import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';
import {
  TokenKeputusan,
  hashDecisionToken,
} from '../entities/workflow/token-keputusan.entity.js';
import type { ApprovalContext } from './approvals.repository.js';
import { ApprovalsService } from './approvals.service.js';

function context(
  tokenStatus = 'UNUSED',
  options: {
    expired?: boolean;
    keputusan?: string | null;
    alasan?: string | null;
    requestStatus?: string;
  } = {},
): ApprovalContext {
  const now = Date.now();
  return {
    token: new TokenKeputusan(
      1,
      10,
      'hash',
      new Date(now - 60_000),
      new Date(now + (options.expired ? -60_000 : 3_600_000)),
      options.keputusan ? new Date(now) : null,
      tokenStatus,
      options.keputusan ?? null,
      options.alasan ?? null,
    ),
    request: PengajuanPeminjaman.fromRow({
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
      status: options.requestStatus ?? 'WAITING_PEMBINA',
      catatan: null,
    }),
    fsk: {
      id_fsk: 1,
      nama_kegiatan: 'Seminar',
      tanggal_mulai: new Date('2099-01-10'),
      tanggal_selesai: new Date('2099-01-10'),
      waktu_mulai: '08:00',
      waktu_selesai: '17:00',
      jumlah_peserta: 100,
      tujuan_kegiatan: 'Belajar',
    },
    peminjam: {
      id_user: 1,
      nama: 'Mahasiswa',
      email: 'mahasiswa@campus.ac.id',
    },
    pembina: {
      id_pembina: 2,
      nama_pembina: 'Dr. Budi',
      email_pembina: 'pembina@campus.ac.id',
    },
    paket: {
      id_paket: 5,
      nama_paket: 'Paket Auditorium',
      skor: 95,
      alasan: 'Kapasitas sesuai',
      snapshot: null,
    },
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

function setup() {
  const repository = {
    findByTokenHash: vi.fn().mockResolvedValue(context()),
    expireIfNeeded: vi.fn().mockResolvedValue('EXPIRED'),
    decide: vi.fn().mockResolvedValue({
      outcome: 'DECIDED',
      next_status: 'WAITING_LOGISTIK',
    }),
  };
  const emailService = {
    send: vi.fn().mockResolvedValue({ status: 'SENT' }),
  };
  const service = new ApprovalsService(
    repository as never,
    emailService as never,
  );
  return { repository, emailService, service };
}

describe('ApprovalsService', () => {
  it('returns the request detail for an unused token', async () => {
    const { service } = setup();

    const result = await service.get('raw-token');

    expect(result.message).toBe('Detail persetujuan');
    expect(result.data.pengajuan).toMatchObject({
      nomor_pengajuan: 'FPP-20260101-ABCD1234',
      status: 'WAITING_PEMBINA',
    });
  });

  it('shows the previous decision when the token was already used', async () => {
    const { repository, service } = setup();
    repository.findByTokenHash.mockResolvedValue(
      context('USED', { keputusan: 'APPROVE', alasan: 'Setuju' }),
    );

    const result = await service.get('raw-token');

    expect(result.message).toBe('Keputusan sudah tercatat');
    expect(result.data.token).toMatchObject({
      status: 'USED',
      keputusan: 'APPROVE',
      alasan: 'Setuju',
    });
  });

  it('marks an expired token and returns APPROVAL_TOKEN_EXPIRED', async () => {
    const { repository, service } = setup();
    repository.findByTokenHash
      .mockResolvedValueOnce(context('UNUSED', { expired: true }))
      .mockResolvedValueOnce(context('EXPIRED', { expired: true }));

    await expectBusinessCode(service.get('raw-token'), 'APPROVAL_TOKEN_EXPIRED');
    expect(repository.expireIfNeeded).toHaveBeenCalledOnce();
  });

  it('returns 404 for an unknown token', async () => {
    const { repository, service } = setup();
    repository.findByTokenHash.mockResolvedValue(null);

    await expect(service.get('unknown')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('records an approval and emails the Pembina', async () => {
    const { repository, emailService, service } = setup();

    const result = await service.decide('raw-token', { decision: 'APPROVE' });

    expect(repository.decide).toHaveBeenCalledWith(
      hashDecisionToken('raw-token'),
      'APPROVE',
      null,
    );
    expect(emailService.send).toHaveBeenCalledOnce();
    expect(result.data.status).toBe('WAITING_LOGISTIK');
  });

  it('requires a reason when rejecting', async () => {
    const { repository, service } = setup();

    await expectBusinessCode(
      service.decide('raw-token', { decision: 'REJECT' }),
      'APPROVAL_REASON_REQUIRED',
    );
    expect(repository.decide).not.toHaveBeenCalled();
  });

  it('records a rejection and notifies both Pembina and Peminjam', async () => {
    const { repository, emailService, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'DECIDED',
      next_status: 'REJECTED_PEMBINA',
    });

    const result = await service.decide('raw-token', {
      decision: 'REJECT',
      reason: 'Jadwal bentrok',
    });

    expect(emailService.send).toHaveBeenCalledTimes(2);
    expect(emailService.send.mock.calls[1][0]).toMatchObject({
      to_email: 'mahasiswa@campus.ac.id',
      template: 'PEMINJAM_REQUEST_REJECTED',
    });
    expect(result.data.status).toBe('REJECTED_PEMBINA');
  });

  it('rejects a reused token with APPROVAL_TOKEN_USED', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'USED',
      keputusan: 'APPROVE',
      alasan: null,
      waktu_digunakan: new Date(),
    });

    await expectBusinessCode(
      service.decide('raw-token', { decision: 'REJECT', reason: 'Ulang' }),
      'APPROVAL_TOKEN_USED',
    );
  });

  it('rejects a token whose request is no longer pending', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({
      outcome: 'NOT_PENDING',
      status: 'CANCELLED',
    });

    await expectBusinessCode(
      service.decide('raw-token', { decision: 'APPROVE' }),
      'APPROVAL_NOT_PENDING',
    );
  });

  it('rejects an expired token decision', async () => {
    const { repository, service } = setup();
    repository.decide.mockResolvedValue({ outcome: 'EXPIRED' });

    await expectBusinessCode(
      service.decide('raw-token', { decision: 'APPROVE' }),
      'APPROVAL_TOKEN_EXPIRED',
    );
  });
});
