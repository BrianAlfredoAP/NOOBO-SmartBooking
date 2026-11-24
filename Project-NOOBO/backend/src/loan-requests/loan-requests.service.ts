import { randomBytes } from 'node:crypto';
import {
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { EmailService } from '../email/email.service.js';
import { PENGAJUAN_STATUS, statusLabel } from '../entities/workflow/pengajuan-status.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { toRequestView } from './loan-requests.mapper.js';
import { TokenKeputusan } from '../entities/workflow/token-keputusan.entity.js';
import { FskService } from '../fsk/fsk.service.js';
import type { PackageView } from '../recommendations/recommendations.repository.js';
import { RecommendationsRepository } from '../recommendations/recommendations.repository.js';
import type {
  CancelLoanRequestDto,
  CreateLoanRequestDto,
} from './dto/loan-request.dto.js';
import type {
  InspectionDto,
  LoanRequestQueryDto,
  LogisticsDecisionDto,
  SubmitReturnDto,
} from './dto/loan-lifecycle.dto.js';
import { LoanRequestsRepository } from './loan-requests.repository.js';

@Injectable()
export class LoanRequestsService {
  constructor(
    private readonly fskService: FskService,
    private readonly recommendations: RecommendationsRepository,
    private readonly repository: LoanRequestsRepository,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly notifications?: NotificationsService,
  ) {}

  async draft(fskId: number, user: AuthenticatedUser) {
    const record = await this.fskService.findOwned(fskId, user);
    const selected = await this.requireSelectedPackage(fskId);
    const rule = await this.requireActiveRule();

    return {
      message: 'Draft FPP',
      data: {
        fsk: {
          ...(record.fsk.viewDetail() as Record<string, unknown>),
          detail_kebutuhan: record.details.map((detail) => detail.viewDetail()),
        },
        paket: selected,
        aturan: {
          id_aturan: rule.id_aturan,
          nama_aturan: rule.nama_aturan,
          deskripsi: rule.deskripsi,
          ketentuan: rule.ketentuan,
        },
      },
    };
  }

  async create(dto: CreateLoanRequestDto, user: AuthenticatedUser) {
    if (dto.setuju_syarat !== true) {
      throw new BusinessException(
        'TERMS_NOT_ACCEPTED',
        'Syarat dan ketentuan wajib disetujui',
        HttpStatus.BAD_REQUEST,
      );
    }

    const record = await this.fskService.findOwned(dto.id_fsk, user);
    const selected = await this.requireSelectedPackage(dto.id_fsk);
    const rule = await this.requireActiveRule();

    const pembina = await this.repository.findPembina(dto.id_pembina);
    if (!pembina) {
      throw new NotFoundException(`Pembina ${dto.id_pembina} tidak ditemukan`);
    }
    if (!pembina.status_aktif) {
      throw new BusinessException(
        'PEMBINA_INACTIVE',
        'Pembina tidak aktif',
        HttpStatus.BAD_REQUEST,
      );
    }

    const active = await this.repository.findActiveByFsk(dto.id_fsk);
    if (active) {
      throw new BusinessException(
        'LOAN_REQUEST_EXISTS',
        'FSK ini sudah memiliki pengajuan aktif',
        HttpStatus.CONFLICT,
      );
    }

    const ttlHours = this.config.get<number>('APPROVAL_TOKEN_TTL_HOURS') ?? 48;
    const token = new TokenKeputusan(0, 0);
    const rawToken = token.generateToken(ttlHours * 60 * 60 * 1000);
    const nomorPengajuan = generateNomorPengajuan();

    const created = await this.repository.create({
      id_user: user.id,
      id_fsk: dto.id_fsk,
      id_paket: Number(selected.id_paket),
      id_pembina: pembina.id_pembina,
      email_pembina: pembina.email_pembina,
      id_aturan: rule.id_aturan,
      nomor_pengajuan: nomorPengajuan,
      token_hash: token.token_hash,
      token_kedaluwarsa_pada: token.kedaluwarsa_pada,
    });

    const approvalUrl = `${this.config.get<string>('APP_URL') ?? 'http://localhost:3000'}/api/v1/approvals/${rawToken}`;
    const email = await this.emailService.send({
      id_pengajuan: created.id_pengajuan,
      to_email: pembina.email_pembina,
      template: 'PEMBINA_APPROVAL_REQUEST',
      subject: `Permohonan persetujuan peminjaman ${nomorPengajuan}`,
      text: [
        `Yth. ${pembina.nama_pembina},`,
        '',
        `${user.email} mengajukan permohonan peminjaman fasilitas kampus.`,
        `Nomor pengajuan: ${nomorPengajuan}`,
        `Kegiatan: ${record.fsk.nama_kegiatan}`,
        `Jadwal: ${formatDate(record.fsk.tanggal_mulai)} ${record.fsk.waktu_mulai} - ${formatDate(record.fsk.tanggal_selesai)} ${record.fsk.waktu_selesai}`,
        `Paket: ${selected.nama_paket}`,
        '',
        `Silakan buka tautan berikut untuk melihat detail dan memberi keputusan (berlaku ${ttlHours} jam):`,
        approvalUrl,
        '',
        'Tautan hanya dapat digunakan satu kali.',
      ].join('\n'),
    });

    return {
      message: 'Pengajuan berhasil dikirim',
      data: {
        id_pengajuan: created.id_pengajuan,
        nomor_pengajuan: created.nomor_pengajuan,
        status: PENGAJUAN_STATUS.WAITING_PEMBINA,
        token_kedaluwarsa_pada: created.token_kedaluwarsa_pada,
        email_status: email.status,
      },
    };
  }

  async cancel(
    id: number,
    dto: CancelLoanRequestDto,
    user: AuthenticatedUser,
  ) {
    const result = await this.repository.cancel(
      id,
      user.id,
      dto.catatan ?? null,
    );

    if (result.outcome === 'NOT_FOUND' || result.outcome === 'NOT_OWNER') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (result.outcome === 'NOT_CANCELLABLE') {
      throw new BusinessException(
        'LOAN_REQUEST_NOT_CANCELLABLE',
        'Pengajuan tidak dapat dibatalkan pada status ini',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${result.status}`],
      );
    }

    return {
      message: 'Pengajuan dibatalkan',
      data: result.request.viewDetail(),
    };
  }

  async list(query: LoanRequestQueryDto, user: AuthenticatedUser) {
    const idUser = user.role === 'PEMINJAM' ? user.id : null;
    const { rows, total } = await this.repository.findMany({
      status: query.status,
      idUser,
      page: query.page,
      limit: query.limit,
    });
    const data: Record<string, unknown>[] = [];
    for (const row of rows) {
      const idPaket = row.id_paket == null ? null : Number(row.id_paket);
      const pkg = await this.repository.findPackageLines(idPaket);
      data.push(toRequestView(row, pkg));
    }
    return paginated('Daftar pengajuan', data, total, query);
  }

  async detail(id: number, user: AuthenticatedUser) {
    return { message: 'Detail pengajuan', data: await this.buildView(id, user) };
  }

  async history(id: number, user: AuthenticatedUser) {
    await this.requireVisible(id, user);
    const rows = await this.repository.listHistory(id);
    return { message: 'Riwayat status pengajuan', data: rows };
  }

  async decideLogistics(
    id: number,
    dto: LogisticsDecisionDto,
    user: AuthenticatedUser,
  ) {
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

    const result = await this.repository.decideLogistics(id, user.id, {
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

    const label = statusLabel(result.status);
    await this.notifications?.notify({
      id_user: result.id_user,
      id_pengajuan: id,
      judul: `Pengajuan ${label}`,
      isi: `${result.nama_kegiatan}: ${label}.${
        dto.alasan ? ` Catatan Logistik: ${dto.alasan}` : ''
      }`,
      kategori: dto.keputusan === 'APPROVE' ? 'Persetujuan' : 'Pengajuan',
    });

    return {
      message: 'Keputusan Logistik disimpan',
      data: { status: result.status, status_label: label },
    };
  }

  async issueSbp(id: number, user: AuthenticatedUser) {
    const result = await this.repository.issueSbp(id, user.id);
    if (result.outcome === 'NOT_FOUND') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (result.outcome === 'INVALID_STATUS') {
      throw new BusinessException(
        'SBP_NOT_ELIGIBLE',
        'SBP hanya dapat diterbitkan setelah pengajuan disetujui Logistik',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(result.status)}`],
      );
    }

    const view = await this.repository.findDetail(id);
    if (view && view.id_user != null) {
      await this.notifications?.notify({
        id_user: Number(view.id_user),
        id_pengajuan: id,
        judul: 'SBP tersedia',
        isi: `Surat Bukti Peminjaman untuk ${String(view.nama_kegiatan)} telah diterbitkan.`,
        kategori: 'Dokumen',
      });
    }

    if (result.outcome !== 'OK') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    return { message: 'SBP diterbitkan', data: result.data };
  }

  async submitReturn(
    id: number,
    dto: SubmitReturnDto,
    user: AuthenticatedUser,
  ) {
    const result = await this.repository.submitReturn(id, user.id, {
      catatan: dto.catatan,
      foto_kerusakan: dto.foto_kerusakan,
      items: dto.items,
    });
    if (result.outcome === 'NOT_FOUND' || result.outcome === 'NOT_OWNER') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (result.outcome === 'INVALID_STATUS') {
      throw new BusinessException(
        'RETURN_NOT_ALLOWED',
        'Laporan pengembalian hanya dapat dikirim saat kegiatan berlangsung',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(result.status)}`],
      );
    }
    return { message: 'Laporan pengembalian dikirim', data: result.data };
  }

  async inspect(id: number, dto: InspectionDto, user: AuthenticatedUser) {
    const result = await this.repository.inspect(id, user.id, {
      catatan: dto.catatan,
      temuan: dto.temuan,
    });
    if (result.outcome === 'NOT_FOUND') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    if (result.outcome === 'INVALID_STATUS') {
      throw new BusinessException(
        'INSPECTION_NOT_ALLOWED',
        'Pemeriksaan hanya dapat dilakukan setelah pengembalian dilaporkan',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${statusLabel(result.status)}`],
      );
    }

    const view = await this.repository.findDetail(id);
    if (view && view.id_user != null) {
      await this.notifications?.notify({
        id_user: Number(view.id_user),
        id_pengajuan: id,
        judul: 'Pemeriksaan pengembalian selesai',
        isi: `Pengajuan ${String(view.nama_kegiatan)} telah selesai.`,
        kategori: 'Pengembalian',
      });
    }

    if (result.outcome !== 'OK') {
      throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    }
    return { message: 'Pemeriksaan diselesaikan', data: result.data };
  }

  private async buildView(
    id: number,
    user: AuthenticatedUser,
  ): Promise<Record<string, unknown>> {
    const idUser = user.role === 'PEMINJAM' ? user.id : null;
    const row = await this.repository.findDetail(id, idUser);
    if (!row) throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    const idPaket = row.id_paket == null ? null : Number(row.id_paket);
    const pkg = await this.repository.findPackageLines(idPaket);
    const history = await this.repository.listHistory(id);
    const returnDetails = await this.repository.listReturnDetails(id);
    return toRequestView(row, pkg, {
      history,
      return_details: returnDetails,
    });
  }

  private async requireVisible(
    id: number,
    user: AuthenticatedUser,
  ): Promise<void> {
    const idUser = user.role === 'PEMINJAM' ? user.id : null;
    const row = await this.repository.findDetail(id, idUser);
    if (!row) throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
  }

  private async requireSelectedPackage(idFsk: number): Promise<PackageView> {
    const packages = await this.recommendations.findByFsk(idFsk);
    const selected = packages.find((item) => item.dipilih);
    if (!selected) {
      throw new BusinessException(
        'PACKAGE_NOT_SELECTED',
        'Pilih paket rekomendasi terlebih dahulu',
        HttpStatus.CONFLICT,
      );
    }
    return selected;
  }

  private async requireActiveRule() {
    const rule = await this.repository.findActiveRule();
    if (!rule) {
      throw new BusinessException(
        'LOAN_RULE_UNAVAILABLE',
        'Belum ada aturan peminjaman yang aktif',
        HttpStatus.CONFLICT,
      );
    }
    return rule;
  }
}

function generateNomorPengajuan(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  return `FPP-${date}-${randomBytes(4).toString('hex').toUpperCase()}`;
}

function formatDate(value: Date): string {
  return new Date(value).toISOString().slice(0, 10);
}
