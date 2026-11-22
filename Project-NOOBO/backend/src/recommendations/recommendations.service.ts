import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { AllocationsRepository } from '../allocations/allocations.repository.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import type { FskRecord } from '../fsk/fsk.repository.js';
import { FskService } from '../fsk/fsk.service.js';
import { Logistik } from '../entities/logistics/logistik.entity.js';
import { Ruangan } from '../entities/logistics/ruangan.entity.js';
import { scorePackage } from './recommendation-scoring.js';
import type { PackageDraft } from './recommendations.repository.js';
import { RecommendationsRepository } from './recommendations.repository.js';

interface LogisticFit {
  item: Logistik;
  jumlah: number;
  tersedia: number;
}

const MAX_PACKAGES = 3;

@Injectable()
export class RecommendationsService {
  constructor(
    private readonly fskService: FskService,
    private readonly availability: AllocationsRepository,
    private readonly repository: RecommendationsRepository,
  ) {}

  async generate(fskId: number, user: AuthenticatedUser) {
    const record = await this.fskService.findOwned(fskId, user);
    const drafts = await this.buildDrafts(record);

    if (drafts.length === 0) {
      throw new BusinessException(
        'NO_PACKAGE_AVAILABLE',
        'Tidak ada paket yang memenuhi kebutuhan pada periode ini',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.repository.replacePackages(fskId, drafts);
    return {
      message: 'Rekomendasi paket',
      data: await this.repository.findByFsk(fskId),
    };
  }

  async list(fskId: number, user: AuthenticatedUser) {
    await this.fskService.findOwned(fskId, user);
    return {
      message: 'Daftar rekomendasi paket',
      data: await this.repository.findByFsk(fskId),
    };
  }

  async select(fskId: number, idPaket: number, user: AuthenticatedUser) {
    const record = await this.fskService.findOwned(fskId, user);
    const pkg = await this.repository.findById(fskId, idPaket);
    if (!pkg) {
      throw new NotFoundException(`Paket ${idPaket} tidak ditemukan`);
    }

    const start = combineDateTime(record.fsk.tanggal_mulai, record.fsk.waktu_mulai);
    const end = combineDateTime(record.fsk.tanggal_selesai, record.fsk.waktu_selesai);
    const errors: string[] = [];

    if (!pkg.ruangan) {
      errors.push('Paket tidak memiliki ruangan');
    } else if (
      await this.availability.checkRoomConflict(
        Number(pkg.ruangan.id_ruangan),
        start,
        end,
      )
    ) {
      errors.push(
        `Ruangan ${String(pkg.ruangan.nama_ruangan)} sudah dipakai pada periode ini`,
      );
    }

    for (const item of pkg.logistik) {
      const jumlah = Number(item.jumlah);
      const tersedia = await this.availability.availableStock(
        Number(item.id_logistik),
        start,
        end,
      );
      if (tersedia < jumlah) {
        errors.push(
          `Stok ${String(item.nama_logistik)} tersedia ${tersedia}, dibutuhkan ${jumlah}`,
        );
      }
    }

    if (errors.length > 0) {
      throw new BusinessException(
        'PACKAGE_UNAVAILABLE',
        'Paket tidak lagi tersedia, jalankan ulang rekomendasi',
        HttpStatus.CONFLICT,
        errors,
      );
    }

    await this.repository.markSelected(fskId, idPaket);
    return {
      message: 'Paket dipilih',
      data: await this.repository.findById(fskId, idPaket),
    };
  }

  private async buildDrafts(record: FskRecord): Promise<PackageDraft[]> {
    const { fsk, details } = record;
    const start = combineDateTime(fsk.tanggal_mulai, fsk.waktu_mulai);
    const end = combineDateTime(fsk.tanggal_selesai, fsk.waktu_selesai);

    const roomNeed = details.find(
      (detail) => detail.kategori.toUpperCase() === 'RUANGAN',
    );
    const logisticNeeds = details.filter(
      (detail) => detail.kategori.toUpperCase() === 'LOGISTIK',
    );

    const fits: LogisticFit[] = [];
    for (const need of logisticNeeds) {
      const candidates = await this.repository.findLogisticCandidates(
        need.jenis_kebutuhan,
      );
      let chosen: LogisticFit | null = null;
      for (const item of candidates) {
        const tersedia = await this.availability.availableStock(
          item.id_logistik,
          start,
          end,
        );
        if (tersedia >= need.jumlah) {
          chosen = { item, jumlah: need.jumlah, tersedia };
          break;
        }
      }
      if (!chosen) return [];
      fits.push(chosen);
    }

    const rooms = await this.repository.findCandidateRooms(
      fsk.jumlah_peserta,
      roomNeed?.jenis_kebutuhan,
    );

    const totalKebutuhan = logisticNeeds.length + (roomNeed ? 1 : 0);
    const kebutuhanTerpenuhi = fits.length + (roomNeed ? 1 : 0);
    const drafts: PackageDraft[] = [];

    for (const room of rooms) {
      if (await this.availability.checkRoomConflict(room.id_ruangan, start, end)) {
        continue;
      }

      drafts.push({
        nama_paket: `Paket ${room.nama_ruangan}`,
        skor: scorePackage({
          jumlah_peserta: fsk.jumlah_peserta,
          kapasitas: room.kapasitas,
          kondisi: [
            room.kondisi_fasilitas,
            ...fits.map((fit) => fit.item.kondisi_fasilitas),
          ],
          stock: fits.map((fit) => ({
            jumlah: fit.jumlah,
            tersedia: fit.tersedia,
          })),
          kebutuhanTerpenuhi,
          totalKebutuhan,
        }),
        alasan: buildReason(room, fsk.jumlah_peserta, fits),
        snapshot: {
          fsk: fsk.viewDetail(),
          ruangan: room.viewDetail(),
          logistik: fits.map((fit) => ({
            ...(fit.item.viewDetail() as Record<string, unknown>),
            jumlah: fit.jumlah,
            stok_tersedia: fit.tersedia,
          })),
        },
        id_ruangan: room.id_ruangan,
        logistik: fits.map((fit) => ({
          id_logistik: fit.item.id_logistik,
          jumlah: fit.jumlah,
        })),
      });
    }

    return drafts
      .sort((left, right) => right.skor - left.skor)
      .slice(0, MAX_PACKAGES);
  }
}

function combineDateTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const combined = new Date(date);
  combined.setHours(hours || 0, minutes || 0, 0, 0);
  return combined;
}

function buildReason(
  room: Ruangan,
  jumlahPeserta: number,
  fits: LogisticFit[],
): string {
  const parts = [
    `Kapasitas ${room.kapasitas} untuk ${jumlahPeserta} peserta`,
    `Kondisi ruangan ${room.kondisi_fasilitas}`,
  ];

  for (const fit of fits) {
    parts.push(
      `Stok ${fit.item.nama_logistik} ${fit.tersedia} tersedia untuk kebutuhan ${fit.jumlah}`,
    );
  }
  if (fits.length === 0) {
    parts.push('Tidak ada kebutuhan logistik tambahan');
  }

  return parts.join('; ');
}
