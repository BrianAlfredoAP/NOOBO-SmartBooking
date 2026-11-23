import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { EmailService } from '../email/email.service.js';
import {
  TOKEN_STATUS,
  hashDecisionToken,
} from '../entities/workflow/token-keputusan.entity.js';
import type { ApprovalDecisionDto } from './dto/approval-decision.dto.js';
import type { ApprovalContext } from './approvals.repository.js';
import { ApprovalsRepository } from './approvals.repository.js';

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly repository: ApprovalsRepository,
    private readonly emailService: EmailService,
  ) {}

  async get(rawToken: string) {
    const tokenHash = hashDecisionToken(rawToken);
    let context = await this.repository.findByTokenHash(tokenHash);
    if (!context) {
      throw new NotFoundException('Tautan persetujuan tidak valid');
    }

    if (
      context.token.status === TOKEN_STATUS.UNUSED &&
      context.token.isExpired()
    ) {
      await this.repository.expireIfNeeded(tokenHash);
      context = await this.repository.findByTokenHash(tokenHash);
    }

    if (context?.token.status === TOKEN_STATUS.EXPIRED) {
      throw new BusinessException(
        'APPROVAL_TOKEN_EXPIRED',
        'Tautan persetujuan sudah kedaluwarsa',
        HttpStatus.GONE,
      );
    }

    return {
      message:
        context?.token.status === TOKEN_STATUS.USED
          ? 'Keputusan sudah tercatat'
          : 'Detail persetujuan',
      data: this.toView(context as ApprovalContext),
    };
  }

  async decide(rawToken: string, dto: ApprovalDecisionDto) {
    const reason = dto.reason?.trim() || null;
    if (dto.decision === 'REJECT' && !reason) {
      throw new BusinessException(
        'APPROVAL_REASON_REQUIRED',
        'Alasan wajib diisi saat menolak pengajuan',
        HttpStatus.BAD_REQUEST,
      );
    }

    const tokenHash = hashDecisionToken(rawToken);
    const outcome = await this.repository.decide(
      tokenHash,
      dto.decision,
      reason,
    );

    if (outcome.outcome === 'NOT_FOUND') {
      throw new NotFoundException('Tautan persetujuan tidak valid');
    }
    if (outcome.outcome === 'USED') {
      throw new BusinessException(
        'APPROVAL_TOKEN_USED',
        'Tautan persetujuan sudah digunakan',
        HttpStatus.CONFLICT,
        [
          `Keputusan sebelumnya: ${outcome.keputusan ?? '-'}`,
          ...(outcome.alasan ? [`Alasan: ${outcome.alasan}`] : []),
        ],
      );
    }
    if (outcome.outcome === 'EXPIRED') {
      throw new BusinessException(
        'APPROVAL_TOKEN_EXPIRED',
        'Tautan persetujuan sudah kedaluwarsa',
        HttpStatus.GONE,
      );
    }
    if (outcome.outcome === 'NOT_PENDING') {
      throw new BusinessException(
        'APPROVAL_NOT_PENDING',
        'Pengajuan tidak sedang menunggu keputusan Pembina',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${outcome.status}`],
      );
    }

    const context = await this.repository.findByTokenHash(tokenHash);
    if (context) {
      await this.sendDecisionEmails(context, dto.decision, reason);
    }

    return {
      message:
        dto.decision === 'APPROVE'
          ? 'Pengajuan disetujui'
          : 'Pengajuan ditolak',
      data: {
        nomor_pengajuan: context?.request.nomor_pengajuan ?? null,
        status: outcome.next_status,
        keputusan: dto.decision,
        alasan: reason,
      },
    };
  }

  private async sendDecisionEmails(
    context: ApprovalContext,
    decision: 'APPROVE' | 'REJECT',
    reason: string | null,
  ): Promise<void> {
    await this.emailService.send({
      id_pengajuan: context.request.id_pengajuan,
      to_email: context.pembina.email_pembina,
      template: 'PEMBINA_DECISION_CONFIRMATION',
      subject: `Keputusan pengajuan ${context.request.nomor_pengajuan}`,
      text: [
        `Yth. ${context.pembina.nama_pembina},`,
        '',
        `Keputusan Anda untuk pengajuan ${context.request.nomor_pengajuan} telah dicatat.`,
        `Keputusan: ${decision === 'APPROVE' ? 'DISETUJUI' : 'DITOLAK'}`,
        `Kegiatan: ${context.fsk.nama_kegiatan}`,
        ...(reason ? [`Alasan: ${reason}`] : []),
        '',
        'Terima kasih.',
      ].join('\n'),
    });

    if (decision !== 'REJECT') return;

    await this.emailService.send({
      id_pengajuan: context.request.id_pengajuan,
      to_email: context.peminjam.email,
      template: 'PEMINJAM_REQUEST_REJECTED',
      subject: `Pengajuan ${context.request.nomor_pengajuan} ditolak Pembina`,
      text: [
        `Halo ${context.peminjam.nama},`,
        '',
        `Pengajuan ${context.request.nomor_pengajuan} (${context.fsk.nama_kegiatan}) ditolak oleh Pembina.`,
        ...(reason ? [`Alasan: ${reason}`] : []),
        '',
        'Silakan ajukan ulang setelah memperbaiki pengajuan.',
      ].join('\n'),
    });
  }

  private toView(context: ApprovalContext) {
    return {
      token: {
        status: context.token.status,
        keputusan: context.token.keputusan,
        alasan: context.token.alasan,
        waktu_digunakan: context.token.waktu_digunakan,
        kedaluwarsa_pada: context.token.kedaluwarsa_pada,
      },
      pengajuan: {
        id_pengajuan: context.request.id_pengajuan,
        nomor_pengajuan: context.request.nomor_pengajuan,
        status: context.request.status,
        nama_kegiatan: context.fsk.nama_kegiatan,
        tanggal_mulai: context.fsk.tanggal_mulai,
        tanggal_selesai: context.fsk.tanggal_selesai,
        waktu_mulai: context.fsk.waktu_mulai,
        waktu_selesai: context.fsk.waktu_selesai,
        jumlah_peserta: context.fsk.jumlah_peserta,
        tujuan_kegiatan: context.fsk.tujuan_kegiatan,
        peminjam: context.peminjam,
        pembina: context.pembina,
        paket: context.paket,
      },
    };
  }
}
