import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { Ruangan } from '../entities/logistics/ruangan.entity.js';
import type { CreateRoomDto, RoomQueryDto, UpdateRoomDto } from './dto/room.dto.js';

@Injectable()
export class RoomsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(query: RoomQueryDto): Promise<{ items: Ruangan[]; total: number }> {
    const conditions: string[] = [];
    const params: SqlParam[] = [];
    if (query.q) {
      conditions.push('(nama_ruangan LIKE ? OR lokasi LIKE ?)');
      params.push(`%${query.q}%`, `%${query.q}%`);
    }
    if (query.jenis) {
      conditions.push('jenis = ?');
      params.push(query.jenis);
    }
    if (query.status_aktif !== undefined) {
      conditions.push('status_aktif = ?');
      params.push(query.status_aktif);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM ruangan ${where}`,
      params,
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM ruangan ${where} ORDER BY id_ruangan DESC LIMIT ? OFFSET ?`,
      [...params, query.limit, (query.page - 1) * query.limit],
    );
    return {
      items: rows.map((row) => Ruangan.fromRow(row)),
      total: Number(countRows[0].total),
    };
  }

  async findById(id: number): Promise<Ruangan | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM ruangan WHERE id_ruangan = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? Ruangan.fromRow(row) : null;
  }

  async findByName(nama: string, excludeId = 0): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM ruangan WHERE nama_ruangan = ? AND id_ruangan <> ? LIMIT 1',
      [nama, excludeId],
    );
    return rows.length > 0;
  }

  async create(dto: CreateRoomDto): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO ruangan
         (nama_ruangan, jenis, lokasi, kapasitas, kondisi_fasilitas,
          kode_ruangan, gedung, lantai, fasilitas, foto, deskripsi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.nama_ruangan,
        dto.jenis,
        dto.lokasi,
        dto.kapasitas,
        dto.kondisi_fasilitas ?? 'Baik',
        dto.kode_ruangan ?? null,
        dto.gedung ?? null,
        dto.lantai ?? null,
        dto.fasilitas ? JSON.stringify(dto.fasilitas) : null,
        dto.foto ?? null,
        dto.deskripsi ?? null,
      ],
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdateRoomDto): Promise<void> {
    await this.pool.execute(
      `UPDATE ruangan SET
         nama_ruangan = COALESCE(?, nama_ruangan),
         jenis = COALESCE(?, jenis),
         lokasi = COALESCE(?, lokasi),
         kapasitas = COALESCE(?, kapasitas),
         kondisi_fasilitas = COALESCE(?, kondisi_fasilitas),
         status_aktif = COALESCE(?, status_aktif),
         kode_ruangan = COALESCE(?, kode_ruangan),
         gedung = COALESCE(?, gedung),
         lantai = COALESCE(?, lantai),
         fasilitas = COALESCE(?, fasilitas),
         foto = COALESCE(?, foto),
         deskripsi = COALESCE(?, deskripsi)
       WHERE id_ruangan = ?`,
      [
        dto.nama_ruangan ?? null,
        dto.jenis ?? null,
        dto.lokasi ?? null,
        dto.kapasitas ?? null,
        dto.kondisi_fasilitas ?? null,
        dto.status_aktif ?? null,
        dto.kode_ruangan ?? null,
        dto.gedung ?? null,
        dto.lantai ?? null,
        dto.fasilitas ? JSON.stringify(dto.fasilitas) : null,
        dto.foto ?? null,
        dto.deskripsi ?? null,
        id,
      ],
    );
  }

  async hasActiveAllocation(id: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM alokasi_ruangan
       WHERE id_ruangan = ? AND status_alokasi NOT IN ('RELEASED', 'CANCELLED') LIMIT 1`,
      [id],
    );
    return rows.length > 0;
  }
}
