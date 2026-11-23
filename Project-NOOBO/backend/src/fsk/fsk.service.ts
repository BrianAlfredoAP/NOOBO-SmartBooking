import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import type { CreateFskDto, FskDetailDto, UpdateFskDto } from './dto/fsk.dto.js';
import type { FskRecord } from './fsk.repository.js';
import { FskRepository } from './fsk.repository.js';

interface ScheduleInput {
  tanggal_mulai: string;
  tanggal_selesai: string;
  jumlah_peserta: number;
}

@Injectable()
export class FskService {
  constructor(private readonly repository: FskRepository) {}

  async create(dto: CreateFskDto, user: AuthenticatedUser) {
    this.validateBusiness(
      {
        tanggal_mulai: dto.tanggal_mulai,
        tanggal_selesai: dto.tanggal_selesai,
        jumlah_peserta: dto.jumlah_peserta,
      },
      dto.detail_kebutuhan,
    );

    const id = await this.repository.create(user.id, dto);
    return this.detail(id, user);
  }

  async update(id: number, dto: UpdateFskDto, user: AuthenticatedUser) {
    const existing = await this.requireOwned(id, user);

    this.validateBusiness(
      {
        tanggal_mulai:
          dto.tanggal_mulai ?? toDateOnly(existing.fsk.tanggal_mulai),
        tanggal_selesai:
          dto.tanggal_selesai ?? toDateOnly(existing.fsk.tanggal_selesai),
        jumlah_peserta: dto.jumlah_peserta ?? existing.fsk.jumlah_peserta,
      },
      dto.detail_kebutuhan,
    );

    await this.repository.update(id, dto);
    return this.detail(id, user);
  }

  async findOwned(id: number, user: AuthenticatedUser): Promise<FskRecord> {
    return this.requireOwned(id, user);
  }

  private async detail(id: number, user: AuthenticatedUser) {
    const record = await this.requireOwned(id, user);
    return {
      message: 'Detail FSK',
      data: {
        ...record.fsk.viewDetail(),
        detail_kebutuhan: record.details.map((detail) => detail.viewDetail()),
      },
    };
  }

  private async requireOwned(id: number, user: AuthenticatedUser) {
    const record = await this.repository.findById(id);
    if (!record || record.fsk.id_user !== user.id) {
      throw new NotFoundException(`FSK ${id} tidak ditemukan`);
    }
    return record;
  }

  private validateBusiness(input: ScheduleInput, details?: FskDetailDto[]): void {
    if (!Number.isInteger(input.jumlah_peserta) || input.jumlah_peserta <= 0) {
      throw new BusinessException(
        'FSK_INVALID_CAPACITY',
        'Jumlah peserta harus lebih dari 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    const start = parseDateOnly(input.tanggal_mulai);
    const end = parseDateOnly(input.tanggal_selesai);
    const scheduleErrors: string[] = [];
    if (start && end && start.getTime() > end.getTime()) {
      scheduleErrors.push(
        'Tanggal mulai tidak boleh setelah tanggal selesai',
      );
    }
    if (start && start.getTime() < startOfToday().getTime()) {
      scheduleErrors.push('Tanggal mulai tidak boleh di masa lalu');
    }
    if (scheduleErrors.length > 0) {
      throw new BusinessException(
        'FSK_INVALID_SCHEDULE',
        'Jadwal FSK tidak valid',
        HttpStatus.BAD_REQUEST,
        scheduleErrors,
      );
    }

    if (
      details?.some(
        (detail) => !Number.isInteger(detail.jumlah) || detail.jumlah <= 0,
      )
    ) {
      throw new BusinessException(
        'FSK_INVALID_DETAIL',
        'Jumlah detail kebutuhan harus lebih dari 0',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}

function parseDateOnly(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toDateOnly(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
