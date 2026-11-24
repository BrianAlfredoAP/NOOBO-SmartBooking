import { Inject, Injectable } from '@nestjs/common';
import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import { Notifikasi } from '../entities/core/notifikasi.entity.js';

export interface CreateNotifikasiInput {
  id_user: number;
  id_pengajuan?: number | null;
  judul: string;
  isi: string;
  kategori?: string;
}

@Injectable()
export class NotificationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByUser(idUser: number): Promise<Notifikasi[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM notifikasi
       WHERE id_user = ?
       ORDER BY dibuat_pada DESC, id_notifikasi DESC`,
      [idUser],
    );
    return rows.map((row) => Notifikasi.fromRow(row));
  }

  async create(input: CreateNotifikasiInput): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      `INSERT INTO notifikasi (id_user, id_pengajuan, judul, isi, kategori)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.id_user,
        input.id_pengajuan ?? null,
        input.judul,
        input.isi,
        input.kategori ?? 'Pengajuan',
      ],
    );
    return result.insertId;
  }

  async markRead(id: number, idUser: number): Promise<boolean> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE notifikasi SET sudah_dibaca = TRUE WHERE id_notifikasi = ? AND id_user = ?',
      [id, idUser],
    );
    return result.affectedRows > 0;
  }

  async markAllRead(idUser: number): Promise<number> {
    const [result] = await this.pool.execute<ResultSetHeader>(
      'UPDATE notifikasi SET sudah_dibaca = TRUE WHERE id_user = ? AND sudah_dibaca = FALSE',
      [idUser],
    );
    return result.affectedRows;
  }
}
