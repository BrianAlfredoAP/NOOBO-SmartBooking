import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { TERMINAL_REQUEST_STATUSES } from '../common/constants.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { AturanPeminjaman } from '../entities/workflow/aturan-peminjaman.entity.js';
import type {
  CreateLoanRuleDto,
  LoanRuleQueryDto,
  UpdateLoanRuleDto,
} from './dto/loan-rule.dto.js';

const TERMINAL_PLACEHOLDERS = TERMINAL_REQUEST_STATUSES.map(() => '?').join(', ');

@Injectable()
export class LoanRulesRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findAll(query: LoanRuleQueryDto): Promise<{ items: AturanPeminjaman[]; total: number }> {
    const conditions: string[] = [];
    const params: SqlParam[] = [];
    if (query.q) {
      conditions.push('nama_aturan LIKE ?');
      params.push(`%${query.q}%`);
    }
    if (query.aktif !== undefined) {
      conditions.push('aktif = ?');
      params.push(query.aktif);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM aturan_peminjaman ${where}`,
      params,
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM aturan_peminjaman ${where} ORDER BY id_aturan DESC LIMIT ? OFFSET ?`,
      [...params, query.limit, (query.page - 1) * query.limit],
    );
    return {
      items: rows.map((row) => AturanPeminjaman.fromRow(row)),
      total: Number(countRows[0].total),
    };
  }

  async findById(id: number): Promise<AturanPeminjaman | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM aturan_peminjaman WHERE id_aturan = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? AturanPeminjaman.fromRow(row) : null;
  }

  async findByName(nama: string, excludeId = 0): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT 1 FROM aturan_peminjaman WHERE nama_aturan = ? AND id_aturan <> ? LIMIT 1',
      [nama, excludeId],
    );
    return rows.length > 0;
  }

  async create(dto: CreateLoanRuleDto): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'INSERT INTO aturan_peminjaman (nama_aturan, deskripsi, ketentuan) VALUES (?, ?, ?)',
      [dto.nama_aturan, dto.deskripsi ?? '', dto.ketentuan],
    );
    return result.insertId;
  }

  async update(id: number, dto: UpdateLoanRuleDto): Promise<void> {
    await this.pool.execute(
      `UPDATE aturan_peminjaman SET
         nama_aturan = COALESCE(?, nama_aturan),
         deskripsi = COALESCE(?, deskripsi),
         ketentuan = COALESCE(?, ketentuan),
         aktif = COALESCE(?, aktif)
       WHERE id_aturan = ?`,
      [
        dto.nama_aturan ?? null,
        dto.deskripsi ?? null,
        dto.ketentuan ?? null,
        dto.aktif ?? null,
        id,
      ],
    );
  }

  async hasActiveRequest(id: number): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM pengajuan_peminjaman
       WHERE id_aturan = ? AND status NOT IN (${TERMINAL_PLACEHOLDERS}) LIMIT 1`,
      [id, ...TERMINAL_REQUEST_STATUSES],
    );
    return rows.length > 0;
  }
}
