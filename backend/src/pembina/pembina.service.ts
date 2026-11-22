import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { Pembina } from '../entities/workflow/pembina.entity.js';
import type { CreatePembinaDto, PembinaQueryDto, UpdatePembinaDto } from './dto/pembina.dto.js';
import { PembinaRepository } from './pembina.repository.js';

@Injectable()
export class PembinaService {
  constructor(private readonly repository: PembinaRepository) {}

  async findAll(query: PembinaQueryDto) {
    const { items, total } = await this.repository.findAll(query);
    return paginated('Daftar pembina', items.map((item) => item.viewPengajuan()[0]), total, query);
  }

  async findOne(id: number) {
    const pembina = await this.require(id);
    return { message: 'Detail pembina', data: pembina.viewPengajuan()[0] };
  }

  async create(dto: CreatePembinaDto) {
    if (await this.repository.findByEmail(dto.email_pembina)) {
      throw new BusinessException(
        'PEMBINA_EMAIL_TAKEN',
        'Email pembina sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    const id = await this.repository.create(dto);
    return this.findOne(id);
  }

  async update(id: number, dto: UpdatePembinaDto) {
    const pembina = await this.require(id);
    if (
      dto.email_pembina &&
      dto.email_pembina !== pembina.email_pembina &&
      (await this.repository.findByEmail(dto.email_pembina, id))
    ) {
      throw new BusinessException(
        'PEMBINA_EMAIL_TAKEN',
        'Email pembina sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const pembina = await this.require(id);
    if (await this.repository.hasActiveRequest(id)) {
      throw new BusinessException(
        'PEMBINA_IN_USE',
        'Pembina masih terkait pengajuan aktif',
        HttpStatus.CONFLICT,
      );
    }
    if (pembina.status_aktif) await this.repository.update(id, { status_aktif: false });
    return { message: 'Pembina dinonaktifkan' };
  }

  private async require(id: number): Promise<Pembina> {
    const pembina = await this.repository.findById(id);
    if (!pembina) throw new NotFoundException(`Pembina ${id} tidak ditemukan`);
    return pembina;
  }
}
