import { Injectable, Inject } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { UserRecord } from './users.types.js';

const USER_SELECT = `
  SELECT u.id_user, u.role_id, r.name AS role, u.nama, u.email, u.password_hash,
         u.status_aktif, u.whatsapp, u.created_at
  FROM users u
  JOIN roles r ON u.role_id = r.id
`;

@Injectable()
export class UsersRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `${USER_SELECT} WHERE u.email = ? LIMIT 1`,
      [email],
    );
    return (rows[0] as UserRecord | undefined) ?? null;
  }

  async findById(id: number): Promise<UserRecord | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `${USER_SELECT} WHERE u.id_user = ? LIMIT 1`,
      [id],
    );
    return (rows[0] as UserRecord | undefined) ?? null;
  }

  async createUser(input: {
    role_id: number;
    nama: string;
    email: string;
    password_hash: string;
    status_aktif?: boolean;
  }): Promise<UserRecord> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO users (role_id, nama, email, password_hash, status_aktif)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.role_id,
        input.nama,
        input.email,
        input.password_hash,
        input.status_aktif ?? true,
      ],
    );
    const created = await this.findById(result.insertId);
    if (!created) throw new Error('User created but could not be read back');
    return created;
  }

  async updateProfile(
    id: number,
    input: { nama?: string; whatsapp?: string },
  ): Promise<void> {
    await this.pool.execute(
      `UPDATE users SET
         nama = COALESCE(?, nama),
         whatsapp = COALESCE(?, whatsapp)
       WHERE id_user = ?`,
      [input.nama ?? null, input.whatsapp ?? null, id],
    );
  }
}
