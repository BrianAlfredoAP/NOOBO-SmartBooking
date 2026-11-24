import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderSbpPdf } from './sbp-document.js';
import { SbpService } from './sbp.service.js';

const logistikUser = { id: 3, email: 'logistik@campus.ac.id', role: 'LOGISTIK' };
const peminjamUser = { id: 1, email: 'mahasiswa@campus.ac.id', role: 'PEMINJAM' };

const baseContext = {
  id_pengajuan: 7,
  id_user: 1,
  status: 'APPROVED_LOGISTIK',
  nomor_pengajuan: 'FPP-20260101-ABCD',
  nama_kegiatan: 'Rapat Koordinasi UKM',
  tujuan_kegiatan: 'Koordinasi',
  tanggal_mulai: new Date('2026-11-12T00:00:00'),
  tanggal_selesai: new Date('2026-11-12T00:00:00'),
  waktu_mulai: '13:00',
  waktu_selesai: '15:00',
  jumlah_peserta: 28,
  nama_peminjam: 'Aria Restu',
  email_peminjam: 'mahasiswa@campus.ac.id',
  whatsapp: '0812',
  nama_pembina: 'Dr. Budi',
  existing_sbp: null,
};

describe('renderSbpPdf', () => {
  it('produces a real PDF buffer containing the SBP particulars', async () => {
    const pdf = await renderSbpPdf({
      nomor_sbp: 'SBP-20261124-ABCD1234',
      tanggal_terbit: new Date('2026-11-24T10:00:00'),
      nomor_pengajuan: 'FPP-20260101-ABCD',
      nama_peminjam: 'Aria Restu',
      email_peminjam: 'mahasiswa@campus.ac.id',
      whatsapp: '0812',
      nama_kegiatan: 'Rapat Koordinasi UKM',
      tujuan_kegiatan: 'Koordinasi',
      tanggal_mulai: new Date('2026-11-12T00:00:00'),
      tanggal_selesai: new Date('2026-11-12T00:00:00'),
      waktu_mulai: '13:00',
      waktu_selesai: '15:00',
      jumlah_peserta: 28,
      pembina: 'Dr. Budi',
      ruangan: ['Ruang Rapat UKM'],
      logistik: [{ nama: 'Proyektor', jumlah: 2, satuan: 'unit' }],
    });

    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(pdf.length).toBeGreaterThan(1000);
  });
});

describe('SbpService', () => {
  let storageDir: string;

  beforeAll(async () => {
    storageDir = await mkdtemp(path.join(tmpdir(), 'sbp-test-'));
  });

  afterAll(async () => {
    await rm(storageDir, { recursive: true, force: true });
  });

  function setup(context: Record<string, unknown> = baseContext) {
    const repository = {
      findContext: vi.fn().mockResolvedValue(context),
      findIdPaket: vi.fn().mockResolvedValue(5),
      findPackageContents: vi.fn().mockResolvedValue({
        ruangan: ['Ruang Rapat UKM'],
        logistik: [{ nama: 'Proyektor', jumlah: 2, satuan: 'unit' }],
      }),
      issue: vi.fn().mockResolvedValue({
        outcome: 'OK',
        id_sbp: 11,
        nomor_sbp: 'SBP-20261124-ABCD1234',
        lokasi_dokumen: '/documents/sbp/SBP-20261124-ABCD1234.pdf',
        tanggal_terbit: new Date(),
      }),
      findDocument: vi.fn().mockResolvedValue(null),
    };
    const config = { get: vi.fn(() => storageDir) };
    const service = new SbpService(repository as never, config as never);
    return { repository, service };
  }

  it('refuses to issue SBP before Pembina and Logistik approval', async () => {
    const { repository, service } = setup({
      ...baseContext,
      status: 'WAITING_LOGISTIK',
    });

    await expect(service.issue(7, logistikUser)).rejects.toMatchObject({
      code: 'APPROVAL_INCOMPLETE',
    });
    expect(repository.issue).not.toHaveBeenCalled();
  });

  it('returns the existing document instead of issuing twice', async () => {
    const { repository, service } = setup({
      ...baseContext,
      status: 'ONGOING',
      existing_sbp: {
        id_sbp: 9,
        nomor_sbp: 'SBP-20261120-OLD',
        lokasi_dokumen: '/documents/sbp/SBP-20261120-OLD.pdf',
        tanggal_terbit: new Date(),
      },
    });

    const result = await service.issue(7, logistikUser);

    expect(result.message).toBe('SBP sudah diterbitkan');
    expect(result.data.nomor_sbp).toBe('SBP-20261120-OLD');
    expect(repository.issue).not.toHaveBeenCalled();
  });

  it('writes the PDF then records it in the database', async () => {
    const { repository, service } = setup();

    const result = await service.issue(7, logistikUser);

    expect(repository.issue).toHaveBeenCalledOnce();
    expect(result.message).toBe('SBP diterbitkan');
    expect(result.data.download_url).toBe('/api/v1/me/loan-requests/7/sbp');
  });

  it('reports DOCUMENT_NOT_AVAILABLE when no SBP exists yet', async () => {
    const { service } = setup();

    await expect(service.download(7, peminjamUser)).rejects.toMatchObject({
      code: 'DOCUMENT_NOT_AVAILABLE',
    });
  });

  it('scopes the download lookup to the requesting Peminjam', async () => {
    const { repository, service } = setup();
    repository.findDocument.mockResolvedValue({
      id_sbp: 11,
      id_pengajuan: 7,
      id_user: 1,
      nomor_sbp: 'SBP-20261124-ABCD1234',
      lokasi_dokumen: '/documents/sbp/SBP-20261124-ABCD1234.pdf',
    });

    await service.download(7, peminjamUser);
    expect(repository.findDocument).toHaveBeenCalledWith(7, 1);

    await service.download(7, logistikUser);
    expect(repository.findDocument).toHaveBeenLastCalledWith(7, null);
  });
});
