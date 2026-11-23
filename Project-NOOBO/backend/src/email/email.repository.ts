import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';

export interface EmailOutboxInput {
  id_pengajuan: number | null;
  to_email: string;
  template: string;
}

@Injectable()
export class EmailRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(input: EmailOutboxInput): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO email_logs (id_pengajuan, to_email, template, status)
       VALUES (?, ?, ?, 'PENDING')`,
      [input.id_pengajuan, input.to_email, input.template],
    );
    return result.insertId;
  }

  async markSent(id: number): Promise<void> {
    await this.pool.execute(
      `UPDATE email_logs SET status = 'SENT', error = NULL, sent_at = NOW()
       WHERE id = ?`,
      [id],
    );
  }

  async markFailed(id: number, error: string): Promise<void> {
    await this.pool.execute(
      `UPDATE email_logs SET status = 'FAILED', error = ? WHERE id = ?`,
      [error.slice(0, 1000), id],
    );
  }
}
