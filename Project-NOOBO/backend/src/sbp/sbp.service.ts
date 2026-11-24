import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { statusLabel } from '../entities/workflow/pengajuan-status.js';
import { renderSbpPdf } from './sbp-document.js';
import { SbpRepository } from './sbp.repository.js';

const DOCUMENT_PREFIX = '/documents/sbp/';

@Injectable()
export class SbpService {
  private readonly storageDir: string;

  constructor(
    private readonly repository: SbpRepository,
    config: ConfigService,
  ) {
    this.storageDir = path.resolve(
      config.get<string>('DOCUMENT_STORAGE_DIR') ?? 'storage/documents',
      'sbp',
    );
  }

  async issue(id: number, user: AuthenticatedUser) {
    const context = await this.repository.findContext(id);
    if (!context) {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }

    if (context.existing_sbp) {
      return {
        message: 'SBP sudah diterbitkan',
        data: {
          id_sbp: context.existing_sbp.id_sbp,
          nomor_sbp: context.existing_sbp.nomor_sbp,
          tanggal_terbit: context.existing_sbp.tanggal_terbit,
          lokasi_dokumen: context.existing_sbp.lokasi_dokumen,
          download_url: `/api/v1/me/loan-requests/${id}/sbp`,
        },
      };
    }

    if (context.status !== 'APPROVED_LOGISTIK') {
      throw new BusinessException(
        'APPROVAL_INCOMPLETE',
        'SBP hanya dapat diterbitkan setelah pengajuan disetujui Pembina dan Logistik',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(context.status)}`],
      );
    }

    const idPaket = await this.repository.findIdPaket(id);
    const contents = await this.repository.findPackageContents(idPaket);
    const nomorSbp = generateNomorSbp();
    const lokasiDokumen = `${DOCUMENT_PREFIX}${nomorSbp}.pdf`;

    const pdf = await renderSbpPdf({
      nomor_sbp: nomorSbp,
      tanggal_terbit: new Date(),
      nomor_pengajuan: context.nomor_pengajuan,
      nama_peminjam: context.nama_peminjam,
      email_peminjam: context.email_peminjam,
      whatsapp: context.whatsapp,
      nama_kegiatan: context.nama_kegiatan,
      tujuan_kegiatan: context.tujuan_kegiatan,
      tanggal_mulai: context.tanggal_mulai,
      tanggal_selesai: context.tanggal_selesai,
      waktu_mulai: context.waktu_mulai,
      waktu_selesai: context.waktu_selesai,
      jumlah_peserta: context.jumlah_peserta,
      pembina: context.nama_pembina,
      ruangan: contents.ruangan,
      logistik: contents.logistik,
    });

    await mkdir(this.storageDir, { recursive: true });
    await writeFile(path.join(this.storageDir, `${nomorSbp}.pdf`), pdf);

    const outcome = await this.repository.issue(id, user.id, nomorSbp, lokasiDokumen);
    if (outcome.outcome === 'NOT_FOUND') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (outcome.outcome === 'APPROVAL_INCOMPLETE') {
      throw new BusinessException(
        'APPROVAL_INCOMPLETE',
        'SBP hanya dapat diterbitkan setelah pengajuan disetujui Pembina dan Logistik',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(outcome.status)}`],
      );
    }
    if (outcome.outcome === 'EXISTS') {
      return {
        message: 'SBP sudah diterbitkan',
        data: {
          nomor_sbp: outcome.nomor_sbp,
          lokasi_dokumen: outcome.lokasi_dokumen,
          download_url: `/api/v1/me/loan-requests/${id}/sbp`,
        },
      };
    }

    return {
      message: 'SBP diterbitkan',
      data: {
        id_sbp: outcome.id_sbp,
        nomor_sbp: outcome.nomor_sbp,
        tanggal_terbit: outcome.tanggal_terbit,
        lokasi_dokumen: outcome.lokasi_dokumen,
        download_url: `/api/v1/me/loan-requests/${id}/sbp`,
      },
    };
  }

  async download(id: number, user: AuthenticatedUser) {
    const idUser = user.role === 'PEMINJAM' ? user.id : null;
    const document = await this.repository.findDocument(id, idUser);
    if (!document) {
      throw new BusinessException(
        'DOCUMENT_NOT_AVAILABLE',
        'SBP belum tersedia untuk pengajuan ini',
        HttpStatus.NOT_FOUND,
      );
    }

    const filePath = path.join(this.storageDir, `${document.nomor_sbp}.pdf`);
    return { message: 'Dokumen SBP', data: { ...document, file_path: filePath } };
  }
}

function generateNomorSbp(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  return `SBP-${date}-${randomBytes(4).toString('hex').toUpperCase()}`;
}
