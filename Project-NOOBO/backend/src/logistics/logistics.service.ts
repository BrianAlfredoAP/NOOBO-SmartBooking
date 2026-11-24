import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { combineDateTime } from '../common/datetime.js';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { EmailService } from '../email/email.service.js';
import { PENGAJUAN_STATUS, statusLabel } from '../entities/workflow/pengajuan-status.js';
import { toRequestView } from '../loan-requests/loan-requests.mapper.js';
import { LoanRequestsRepository } from '../loan-requests/loan-requests.repository.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SbpService } from '../sbp/sbp.service.js';
import type {
  LogisticsDecisionDto,
  LogisticsQueueQueryDto,
} from './dto/logistics-decision.dto.js';
import { LogisticsRepository } from './logistics.repository.js';

@Injectable()
export class LogisticsService {
  constructor(
    private readonly repository: LogisticsRepository,
    private readonly requests: LoanRequestsRepository,
    private readonly notifications: NotificationsService,
    private readonly emailService: EmailService,
    private readonly sbp: SbpService,
  ) {}

  async queue(query: LogisticsQueueQueryDto) {
    const { rows, total } = await this.requests.findMany({
      status: query.status ?? PENGAJUAN_STATUS.WAITING_LOGISTIK,
      idUser: null,
      page: query.page,
      limit: query.limit,
    });
    return paginated(
      'Antrean pengajuan Logistik',
      await this.toViews(rows),
      total,
      query,
    );
  }

  async detail(id: number) {
    const row = await this.requests.findDetail(id);
    if (!row) throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);

    const idPaket = row.id_paket == null ? null : Number(row.id_paket);
    const pkg = await this.requests.findPackageLines(idPaket);
    const mulai = combineDateTime(row.tanggal_mulai, row.waktu_mulai);
    const selesai = combineDateTime(row.tanggal_selesai, row.waktu_selesai);
    const plan = await this.repository.planForRequest(idPaket, mulai, selesai);
    const issues = await this.repository.checkAvailability(id, plan);
    const [history, returnDetails] = await Promise.all([
      this.requests.listHistory(id),
      this.requests.listReturnDetails(id),
    ]);

    return {
      message: 'Detail pengajuan untuk Logistik',
      data: {
        ...toRequestView(row, pkg, { history, return_details: returnDetails }),
        availability: { available: issues.length === 0, issues },
      },
    };
  }

  async decide(id: number, dto: LogisticsDecisionDto, user: AuthenticatedUser) {
    if (
      (dto.keputusan === 'REJECT' || dto.keputusan === 'REVISION') &&
      !dto.alasan?.trim()
    ) {
      throw new BusinessException(
        'LOGISTICS_REASON_REQUIRED',
        'Alasan wajib diisi untuk keputusan ini',
        HttpStatus.BAD_REQUEST,
      );
    }

    const result = await this.repository.decide(id, user.id, {
      keputusan: dto.keputusan,
      alasan: dto.alasan,
    });

    if (result.outcome === 'NOT_FOUND') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (result.outcome === 'NOT_PENDING') {
      throw new BusinessException(
        'LOGISTICS_NOT_PENDING',
        'Pengajuan tidak dalam status menunggu Logistik',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(result.status)}`],
      );
    }
    if (result.outcome === 'UNAVAILABLE') {
      const roomConflict = result.issues.some(
        (issue) => issue.type === 'ROOM_CONFLICT',
      );
      throw new BusinessException(
        roomConflict ? 'ROOM_CONFLICT' : 'STOCK_INSUFFICIENT',
        roomConflict
          ? 'Ruangan sudah dibooking pengajuan lain pada jadwal yang sama'
          : 'Stok logistik tidak mencukupi untuk jadwal tersebut',
        HttpStatus.CONFLICT,
        result.issues.map(describeIssue),
      );
    }

    const label = statusLabel(result.status);
    await this.notifyDecision(id, result, dto);

    return {
      message: 'Keputusan Logistik disimpan',
      data: {
        status: result.status,
        status_label: label,
        availability_locked: dto.keputusan === 'APPROVE',
      },
    };
  }

  async ongoing() {
    const rows = await this.requests.listOngoing();
    return {
      message: 'Peminjaman berlangsung',
      data: await this.toViews(rows),
    };
  }

  async issueSbp(id: number, user: AuthenticatedUser) {
    const result = await this.sbp.issue(id, user);
    const row = await this.requests.findDetail(id);
    if (row) {
      await this.notifications.notify({
        id_user: Number(row.id_user),
        id_pengajuan: id,
        judul: 'SBP tersedia',
        isi: `Surat Bukti Peminjaman untuk ${String(row.nama_kegiatan)} telah diterbitkan.`,
        kategori: 'Dokumen',
      });
    }
    return result;
  }

  private async toViews(rows: RowDataPacket[]) {
    const data: Record<string, unknown>[] = [];
    for (const row of rows) {
      const idPaket = row.id_paket == null ? null : Number(row.id_paket);
      const pkg = await this.requests.findPackageLines(idPaket);
      data.push(toRequestView(row, pkg));
    }
    return data;
  }

  private async notifyDecision(
    id: number,
    result: { id_user: number; nama_kegiatan: string; status: string },
    dto: LogisticsDecisionDto,
  ): Promise<void> {
    const label = statusLabel(result.status);
    await this.notifications.notify({
      id_user: result.id_user,
      id_pengajuan: id,
      judul: `Pengajuan ${label}`,
      isi: `${result.nama_kegiatan}: ${label}.${
        dto.alasan ? ` Catatan Logistik: ${dto.alasan}` : ''
      }`,
      kategori: dto.keputusan === 'APPROVE' ? 'Persetujuan' : 'Pengajuan',
    });

    const row = await this.requests.findDetail(id);
    if (!row) return;

    await this.emailService.send({
      id_pengajuan: id,
      to_email: String(row.borrower_email ?? ''),
      template: 'PEMINJAM_LOGISTICS_DECISION',
      subject: `Keputusan Logistik pengajuan ${String(row.nomor_pengajuan)}`,
      text: [
        `Halo ${String(row.borrower_nama ?? 'Peminjam')},`,
        '',
        `Keputusan Logistik untuk pengajuan ${String(row.nomor_pengajuan)} (${result.nama_kegiatan}) telah dicatat.`,
        `Status: ${label}`,
        ...(dto.alasan ? [`Catatan Logistik: ${dto.alasan}`] : []),
        '',
        dto.keputusan === 'APPROVE'
          ? 'Silakan unduh SBP setelah dokumen diterbitkan oleh Logistik.'
          : 'Silakan periksa catatan Logistik dan ajukan ulang bila diperlukan.',
      ].join('\n'),
    });
  }
}

function describeIssue(issue: {
  type: string;
  nama_ruangan?: string;
  nama_logistik?: string;
  diminta?: number;
  tersedia?: number;
}): string {
  if (issue.type === 'ROOM_CONFLICT') {
    return `Ruangan bentrok: ${issue.nama_ruangan ?? '-'}`;
  }
  return `Stok kurang: ${issue.nama_logistik ?? '-'} diminta ${issue.diminta ?? 0}, tersedia ${issue.tersedia ?? 0}`;
}
