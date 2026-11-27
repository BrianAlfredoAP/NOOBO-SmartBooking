import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { statusLabel } from '../entities/workflow/pengajuan-status.js';
import type { SubmitReturnDto } from '../loan-requests/dto/loan-lifecycle.dto.js';
import { toRequestView } from '../loan-requests/loan-requests.mapper.js';
import { LoanRequestsRepository } from '../loan-requests/loan-requests.repository.js';
import type { PaginationDto } from '../common/dto/pagination.dto.js';

@Injectable()
export class MeService {
  constructor(private readonly repository: LoanRequestsRepository) {}

  async list(query: PaginationDto, user: AuthenticatedUser) {
    const { rows, total } = await this.repository.findMany({
      idUser: user.id,
      page: query.page,
      limit: query.limit,
    });
    const data: Record<string, unknown>[] = [];
    for (const row of rows) {
      data.push(await this.toView(row));
    }
    return paginated('Daftar pengajuan saya', data, total, query);
  }

  async detail(id: number, user: AuthenticatedUser) {
    const row = await this.requireOwned(id, user);
    const idPaket = row.id_paket == null ? null : Number(row.id_paket);
    const pkg = await this.repository.findPackageLines(idPaket);
    const [history, returnDetails] = await Promise.all([
      this.repository.listHistory(id),
      this.repository.listReturnDetails(id),
    ]);
    return {
      message: 'Detail pengajuan saya',
      data: toRequestView(row, pkg, {
        history,
        return_details: returnDetails,
      }),
    };
  }

  /** Landasan form SBPG: daftar barang yang dipinjam dari SBP. */
  async returnForm(id: number, user: AuthenticatedUser) {
    const row = await this.requireOwned(id, user);
    if (row.status !== 'ONGOING') {
      throw new BusinessException(
        'RETURN_FORM_UNAVAILABLE',
        'Form pengembalian hanya tersedia saat kegiatan berlangsung',
        HttpStatus.CONFLICT,
        [`Status saat ini: ${String(row.status)}`],
      );
    }

    const { rooms, items } = await this.repository.listAllocations(id);

    return {
      message: 'Form pengembalian',
      data: {
        id_pengajuan: id,
        nomor_pengajuan: String(row.nomor_pengajuan),
        ruangan: rooms.map((room) => ({
          id_alokasi_ruangan: Number(room.id_alokasi_ruangan),
          nama_ruangan: String(room.nama_ruangan),
        })),
        logistik: items.map((item) => ({
          id_alokasi_logistik: Number(item.id_alokasi_logistik),
          nama_logistik: String(item.nama_logistik),
          satuan: String(item.satuan ?? 'unit'),
          jumlah_dipinjam: Number(item.jumlah_dialokasikan),
        })),
      },
    };
  }

  /** Ambil detail SBPG yang sudah dikirim (FR-20, UC-16/17). */
  async getSbpg(id: number, user: AuthenticatedUser) {
    const idUser = user.role === 'PEMINJAM' ? user.id : null;
    const row = await this.repository.findDetail(id, idUser);
    if (!row) throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    if (row.id_sbpg == null) {
      throw new BusinessException(
        'DOCUMENT_NOT_AVAILABLE',
        'SBPG belum tersedia untuk pengajuan ini',
        HttpStatus.NOT_FOUND,
      );
    }
    const items = await this.repository.listReturnDetails(id);
    const ketepatan = String(row.status_ketepatan_waktu ?? 'TEPAT_WAKTU');
    return {
      message: 'Detail SBPG',
      data: {
        id_sbpg: Number(row.id_sbpg),
        id_pengajuan: id,
        nomor_pengajuan: String(row.nomor_pengajuan),
        nama_kegiatan: String(row.nama_kegiatan),
        waktu_kirim: row.waktu_kirim ?? null,
        batas_waktu_kirim: row.batas_waktu_kirim ?? null,
        status_ketepatan_waktu: ketepatan,
        is_late: ketepatan === 'TERLAMBAT',
        catatan_peminjam: String(row.catatan_peminjam ?? ''),
        items,
      },
    };
  }

  /** Kirim laporan pengembalian SBPG oleh Peminjam (FR-20, FR-21, UC-17). */
  async submitSbpg(
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
    if (result.outcome === 'INVALID_ITEMS') {
      throw new BusinessException(
        'SBPG_INVALID_ITEM',
        'Data item pengembalian tidak valid',
        HttpStatus.BAD_REQUEST,
        result.errors,
      );
    }
    return { message: 'Laporan pengembalian dikirim', data: result.data };
  }

  private async toView(row: RowDataPacket): Promise<Record<string, unknown>> {
    const idPaket = row.id_paket == null ? null : Number(row.id_paket);
    const pkg = await this.repository.findPackageLines(idPaket);
    return toRequestView(row, pkg);
  }

  private async requireOwned(id: number, user: AuthenticatedUser) {
    const row = await this.repository.findDetail(id, user.id);
    if (!row) throw new NotFoundException(`Pengajuan ${id} tidak ditemukan`);
    return row;
  }
}
