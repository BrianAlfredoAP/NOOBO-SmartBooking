import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { Ruangan } from '../entities/logistics/ruangan.entity.js';
import type { CreateRoomDto, RoomQueryDto, UpdateRoomDto } from './dto/room.dto.js';
import { RoomsRepository } from './rooms.repository.js';

@Injectable()
export class RoomsService {
  constructor(private readonly repository: RoomsRepository) {}

  async findAll(query: RoomQueryDto) {
    const { items, total } = await this.repository.findAll(query);
    return paginated('Daftar ruangan', items.map((item) => item.viewDetail()), total, query);
  }

  async findOne(id: number) {
    const room = await this.require(id);
    return { message: 'Detail ruangan', data: room.viewDetail() };
  }

  async create(dto: CreateRoomDto) {
    if (await this.repository.findByName(dto.nama_ruangan)) {
      throw new BusinessException(
        'ROOM_NAME_TAKEN',
        'Nama ruangan sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    const id = await this.repository.create(dto);
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateRoomDto) {
    const room = await this.require(id);
    if (
      dto.nama_ruangan &&
      dto.nama_ruangan !== room.nama_ruangan &&
      (await this.repository.findByName(dto.nama_ruangan, id))
    ) {
      throw new BusinessException(
        'ROOM_NAME_TAKEN',
        'Nama ruangan sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    if (
      dto.status_aktif !== undefined &&
      dto.status_aktif !== room.status_aktif &&
      !room.updateStatus(dto.status_aktif)
    ) {
      throw new BusinessException(
        'ROOM_STATUS_INVALID',
        'Status ruangan tidak dapat diubah',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.repository.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const room = await this.require(id);
    if (await this.repository.hasActiveAllocation(id)) {
      throw new BusinessException(
        'ROOM_IN_USE',
        'Ruangan masih terkait pengajuan aktif',
        HttpStatus.CONFLICT,
      );
    }
    if (room.status_aktif) {
      if (!room.updateStatus(false)) {
        throw new BusinessException(
          'ROOM_STATUS_INVALID',
          'Status ruangan tidak dapat diubah',
          HttpStatus.BAD_REQUEST,
        );
      }
      await this.repository.update(id, { status_aktif: false });
    }
    return { message: 'Ruangan dinonaktifkan' };
  }

  private async require(id: number): Promise<Ruangan> {
    const room = await this.repository.findById(id);
    if (!room) throw new NotFoundException(`Ruangan ${id} tidak ditemukan`);
    return room;
  }
}
