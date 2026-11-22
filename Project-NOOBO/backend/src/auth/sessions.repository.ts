import { Injectable, Inject } from '@nestjs/common';
import type { Pool, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';

@Injectable()
export class SessionsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(userId: number, tokenHash: string, expiresAt: Date): Promise<void> {
    await this.pool.execute(
      `INSERT INTO sessions (id_user, token_hash, waktu_kedaluwarsa, status)
       VALUES (?, ?, ?, 'ACTIVE')`,
      [userId, tokenHash, expiresAt],
    );
  }

  async findActiveByTokenHash(tokenHash: string): Promise<boolean> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT 1 FROM sessions
       WHERE token_hash = ? AND status = 'ACTIVE' AND waktu_kedaluwarsa > NOW()
       LIMIT 1`,
      [tokenHash],
    );
    return rows.length > 0;
  }

  async invalidateByTokenHash(tokenHash: string): Promise<void> {
    await this.pool.execute(
      `UPDATE sessions SET status = 'EXPIRED' WHERE token_hash = ?`,
      [tokenHash],
    );
  }
}
