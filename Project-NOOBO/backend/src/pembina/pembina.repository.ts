import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { TERMINAL_REQUEST_STATUSES } from '../common/constants.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { Pembina } from '../entities/workflow/pembina.entity.js';
import type { CreatePembinaDto, PembinaQueryDto, UpdatePembinaDto } from './dto/pembina.dto.js';

const TERMINAL_PLACEHOLDERS = TERMINAL_REQUEST_STATUSES.map(() => '?').join(', ');

@Injectable()
export class PembinaRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(query: PembinaQueryDto): Promise<{ items: Pembina[]; total: number }> {
    const conditions: string[] = [];
    const params: SqlParam[] = [];
    if (query.q) {
      conditions.push('(nama_pembina LIKE ? OR email_pembina LIKE ?)');
      params.push(`%${query.q}%`, `%${query.q}%`);
    }
    if (query.status_aktif !== undefined) {
      conditions.push('status_aktif = ?');
      params.push(query.status_aktif);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM pembina ${where}`,
      params,
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM pembina ${where} ORDER BY id_pembina DESC LIMIT ? OFFSET ?`,
      [...params, query.limit, (query.page - 1) * query.limit],
    );
    return {
      items: rows.map((row) => Pembina.fromRow(row)),
      total: Number(countRows[0].total),
    };
  }

  async findById(id: number): Promise<Pembina | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM pembina WHERE id_pembina = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? Pembina.fromRow(row) : null;
  }

  async findByEmail(email: string, excludeId = 0): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM pembina WHERE email_pembina = ? AND id_pembina <> ? LIMIT 1',
      [email, excludeId],
    );
    return rows.length > 0;
  }

  async create(dto: CreatePembinaDto): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO pembina (nama_pembina, email_pembina) VALUES (?, ?)',
      [dto.nama_pembina, dto.email_pembina],
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdatePembinaDto): Promise<void> {
    await this.pool.execute(
      `UPDATE pembina SET
         nama_pembina = COALESCE(?, nama_pembina),
         email_pembina = COALESCE(?, email_pembina),
         status_aktif = COALESCE(?, status_aktif)
       WHERE id_pembina = ?`,
      [
        dto.nama_pembina ?? null,
        dto.email_pembina ?? null,
        dto.status_aktif ?? null,
        id,
      ],
    );
  }

  async hasActiveRequest(id: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM pengajuan_peminjaman
       WHERE id_pembina = ? AND status NOT IN (${TERMINAL_PLACEHOLDERS}) LIMIT 1`,
      [id, ...TERMINAL_REQUEST_STATUSES],
    );
    return rows.length > 0;
  }
}
