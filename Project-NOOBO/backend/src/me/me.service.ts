import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { RowDataPacket } from 'mysql2/promise.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
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
