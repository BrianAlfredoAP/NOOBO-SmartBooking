import { Inject, Injectable } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';

const ACTIVE_ALLOCATION = "status_alokasi NOT IN ('RELEASED', 'CANCELLED')";

@Injectable()
export class AllocationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async checkRoomConflict(
    idRuangan: number,
    mulai: Date,
    selesai: Date,
  ): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM alokasi_ruangan
       WHERE id_ruangan = ?
         AND ${ACTIVE_ALLOCATION}
         AND tanggal_mulai < ?
         AND tanggal_selesai > ?
       LIMIT 1`,
      [idRuangan, selesai, mulai],
    );
    return rows.length > 0;
  }

  async availableStock(
    idLogistik: number,
    mulai: Date,
    selesai: Date,
  ): Promise<number> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT l.stok_total - COALESCE(SUM(a.jumlah_dialokasikan), 0) AS tersedia
       FROM logistik l
       LEFT JOIN alokasi_logistik a
         ON a.id_logistik = l.id_logistik
        AND a.status_alokasi NOT IN ('RELEASED', 'CANCELLED')
        AND a.tanggal_mulai < ?
        AND a.tanggal_selesai > ?
       WHERE l.id_logistik = ?
       GROUP BY l.id_logistik, l.stok_total`,
      [selesai, mulai, idLogistik],
    );
    const row = rows[0];
    return row ? Math.max(0, Number(row.tersedia)) : 0;
  }
}
