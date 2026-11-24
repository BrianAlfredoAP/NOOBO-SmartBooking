import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { Logistik } from '../entities/logistics/logistik.entity.js';
import type {
  CreateLogisticItemDto,
  LogisticItemQueryDto,
  UpdateLogisticItemDto,
} from './dto/logistic-item.dto.js';

@Injectable()
export class LogisticItemsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(query: LogisticItemQueryDto): Promise<{ items: Logistik[]; total: number }> {
    const conditions: string[] = [];
    const params: SqlParam[] = [];
    if (query.q) {
      conditions.push('nama_logistik LIKE ?');
      params.push(`%${query.q}%`);
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
      `SELECT COUNT(*) AS total FROM logistik ${where}`,
      params,
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM logistik ${where} ORDER BY id_logistik DESC LIMIT ? OFFSET ?`,
      [...params, query.limit, (query.page - 1) * query.limit],
    );
    return {
      items: rows.map((row) => Logistik.fromRow(row)),
      total: Number(countRows[0].total),
    };
  }

  async findById(id: number): Promise<Logistik | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM logistik WHERE id_logistik = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? Logistik.fromRow(row) : null;
  }

  async findByName(nama: string, excludeId = 0): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM logistik WHERE nama_logistik = ? AND id_logistik <> ? LIMIT 1',
      [nama, excludeId],
    );
    return rows.length > 0;
  }

  async create(dto: CreateLogisticItemDto): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO logistik
         (nama_logistik, jenis, stok_total, kondisi_fasilitas,
          kode_logistik, lokasi, satuan, foto, deskripsi)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        dto.nama_logistik,
        dto.jenis,
        dto.stok_total,
        dto.kondisi_fasilitas ?? 'Baik',
        dto.kode_logistik ?? null,
        dto.lokasi ?? null,
        dto.satuan ?? 'unit',
        dto.foto ?? null,
        dto.deskripsi ?? null,
      ],
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdateLogisticItemDto): Promise<void> {
    await this.pool.execute(
      `UPDATE logistik SET
         nama_logistik = COALESCE(?, nama_logistik),
         jenis = COALESCE(?, jenis),
         stok_total = COALESCE(?, stok_total),
         kondisi_fasilitas = COALESCE(?, kondisi_fasilitas),
         status_aktif = COALESCE(?, status_aktif),
         kode_logistik = COALESCE(?, kode_logistik),
         lokasi = COALESCE(?, lokasi),
         satuan = COALESCE(?, satuan),
         foto = COALESCE(?, foto),
         deskripsi = COALESCE(?, deskripsi)
       WHERE id_logistik = ?`,
      [
        dto.nama_logistik ?? null,
        dto.jenis ?? null,
        dto.stok_total ?? null,
        dto.kondisi_fasilitas ?? null,
        dto.status_aktif ?? null,
        dto.kode_logistik ?? null,
        dto.lokasi ?? null,
        dto.satuan ?? null,
        dto.foto ?? null,
        dto.deskripsi ?? null,
        id,
      ],
    );
  }

  async hasActiveAllocation(id: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM alokasi_logistik
       WHERE id_logistik = ? AND status_alokasi NOT IN ('RELEASED', 'CANCELLED') LIMIT 1`,
      [id],
    );
    return rows.length > 0;
  }
}
