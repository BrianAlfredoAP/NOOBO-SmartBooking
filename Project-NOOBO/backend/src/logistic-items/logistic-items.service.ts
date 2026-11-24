import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { Logistik } from '../entities/logistics/logistik.entity.js';
import type {
  CreateLogisticItemDto,
  LogisticItemQueryDto,
  UpdateLogisticItemDto,
} from './dto/logistic-item.dto.js';
import { LogisticItemsRepository } from './logistic-items.repository.js';

@Injectable()
export class LogisticItemsService {
  constructor(private readonly repository: LogisticItemsRepository) {}

  async findAll(query: LogisticItemQueryDto) {
    const { items, total } = await this.repository.findAll(query);
    return paginated('Daftar logistik', items.map((item) => item.viewDetail()), total, query);
  }

  async findOne(id: number) {
    const item = await this.require(id);
    return { message: 'Detail logistik', data: item.viewDetail() };
  }

  async create(dto: CreateLogisticItemDto) {
    if (await this.repository.findByName(dto.nama_logistik)) {
      throw new BusinessException(
        'LOGISTIC_NAME_TAKEN',
        'Nama logistik sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    const id = await this.repository.create(dto);
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateLogisticItemDto) {
    const item = await this.require(id);
    if (
      dto.nama_logistik &&
      dto.nama_logistik !== item.nama_logistik &&
      (await this.repository.findByName(dto.nama_logistik, id))
    ) {
      throw new BusinessException(
        'LOGISTIC_NAME_TAKEN',
        'Nama logistik sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }

    const update: UpdateLogisticItemDto = {
      nama_logistik: dto.nama_logistik,
      jenis: dto.jenis,
      stok_total: dto.stok_total,
      kondisi_fasilitas: dto.kondisi_fasilitas,
      status_aktif: dto.status_aktif,
      kode_logistik: dto.kode_logistik,
      lokasi: dto.lokasi,
      satuan: dto.satuan,
      foto: dto.foto,
      deskripsi: dto.deskripsi,
    };
    if (dto.stok_total !== undefined && dto.stok_total !== item.stok_total) {
      if (!item.updateStok(dto.stok_total - item.stok_total)) {
        throw new BusinessException(
          'LOGISTIC_STOCK_INVALID',
          'Stok tidak boleh negatif',
          HttpStatus.BAD_REQUEST,
        );
      }
      update.stok_total = item.stok_total;
    }

    await this.repository.update(id, update);
    return this.findOne(id);
  }

  async remove(id: number) {
    const item = await this.require(id);
    if (await this.repository.hasActiveAllocation(id)) {
      throw new BusinessException(
        'LOGISTIC_IN_USE',
        'Logistik masih terkait pengajuan aktif',
        HttpStatus.CONFLICT,
      );
    }
    if (item.status_aktif) await this.repository.update(id, { status_aktif: false });
    return { message: 'Logistik dinonaktifkan' };
  }

  private async require(id: number): Promise<Logistik> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Logistik ${id} tidak ditemukan`);
    return item;
  }
}
