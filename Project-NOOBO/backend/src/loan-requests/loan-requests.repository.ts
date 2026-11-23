import { Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise.js';
import { TERMINAL_REQUEST_STATUSES } from '../common/constants.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { AturanPeminjaman } from '../entities/workflow/aturan-peminjaman.entity.js';
import { Pembina } from '../entities/workflow/pembina.entity.js';
import { PENGAJUAN_STATUS } from '../entities/workflow/pengajuan-status.js';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';

const TERMINAL_PLACEHOLDERS = TERMINAL_REQUEST_STATUSES.map(() => '?').join(', ');

export interface CreateLoanRequestInput {
  id_user: number;
  id_fsk: number;
  id_paket: number;
  id_pembina: number;
  email_pembina: string;
  id_aturan: number;
  nomor_pengajuan: string;
  token_hash: string;
  token_kedaluwarsa_pada: Date;
}

export interface CreatedLoanRequest {
  id_pengajuan: number;
  nomor_pengajuan: string;
  token_kedaluwarsa_pada: Date;
}

export type CancelLoanRequestOutcome =
  | { outcome: 'CANCELLED'; request: PengajuanPeminjaman }
  | { outcome: 'NOT_FOUND' }
  | { outcome: 'NOT_OWNER' }
  | { outcome: 'NOT_CANCELLABLE'; status: string };

@Injectable()
export class LoanRequestsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findActiveRule(): Promise<AturanPeminjaman | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM aturan_peminjaman
       WHERE aktif = 1
       ORDER BY id_aturan ASC
       LIMIT 1`,
    );
    const row = rows[0];
    return row ? AturanPeminjaman.fromRow(row) : null;
  }

  async findPembina(id: number): Promise<Pembina | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM pembina WHERE id_pembina = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? Pembina.fromRow(row) : null;
  }

  async findActiveByFsk(idFsk: number): Promise<PengajuanPeminjaman | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM pengajuan_peminjaman
       WHERE id_fsk = ? AND status NOT IN (${TERMINAL_PLACEHOLDERS})
       ORDER BY id_pengajuan DESC
       LIMIT 1`,
      [idFsk, ...TERMINAL_REQUEST_STATUSES],
    );
    const row = rows[0];
    return row ? PengajuanPeminjaman.fromRow(row) : null;
  }

  async findById(id: number): Promise<PengajuanPeminjaman | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    return row ? PengajuanPeminjaman.fromRow(row) : null;
  }

  async create(input: CreateLoanRequestInput): Promise<CreatedLoanRequest> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO pengajuan_peminjaman
           (id_fsk, id_paket, id_pembina, email_pembina, id_aturan,
            setuju_syarat, waktu_setuju, nomor_pengajuan, status)
         VALUES (?, ?, ?, ?, ?, TRUE, NOW(), ?, 'SUBMITTED')`,
        [
          input.id_fsk,
          input.id_paket,
          input.id_pembina,
          input.email_pembina,
          input.id_aturan,
          input.nomor_pengajuan,
        ],
      );
      const idPengajuan = result.insertId;

      await this.insertHistory(
        connection,
        idPengajuan,
        null,
        PENGAJUAN_STATUS.SUBMITTED,
        'PEMINJAM',
        input.id_user,
        'FPP disimpan',
      );

      await connection.execute(
        `INSERT INTO token_keputusan
           (id_pengajuan, token_hash, kedaluwarsa_pada, status)
         VALUES (?, ?, ?, 'UNUSED')`,
        [idPengajuan, input.token_hash, input.token_kedaluwarsa_pada],
      );

      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
        [PENGAJUAN_STATUS.WAITING_PEMBINA, idPengajuan],
      );
      await this.insertHistory(
        connection,
        idPengajuan,
        PENGAJUAN_STATUS.SUBMITTED,
        PENGAJUAN_STATUS.WAITING_PEMBINA,
        'SYSTEM',
        null,
        'Menunggu keputusan Pembina',
      );

      await connection.commit();
      return {
        id_pengajuan: idPengajuan,
        nomor_pengajuan: input.nomor_pengajuan,
        token_kedaluwarsa_pada: input.token_kedaluwarsa_pada,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async cancel(
    id: number,
    idUser: number,
    catatan: string | null,
  ): Promise<CancelLoanRequestOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT p.*, sk.id_user
         FROM pengajuan_peminjaman p
         JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
         WHERE p.id_pengajuan = ?
         LIMIT 1
         FOR UPDATE`,
        [id],
      );
      const row = rows[0];
      if (!row) {
        await connection.rollback();
        return { outcome: 'NOT_FOUND' };
      }
      if (Number(row.id_user) !== idUser) {
        await connection.rollback();
        return { outcome: 'NOT_OWNER' };
      }

      const request = PengajuanPeminjaman.fromRow(row);
      const previousStatus = request.status;
      if (!request.updateStatus(PENGAJUAN_STATUS.CANCELLED, catatan ?? undefined)) {
        await connection.rollback();
        return { outcome: 'NOT_CANCELLABLE', status: request.status };
      }

      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ?, catatan = COALESCE(?, catatan) WHERE id_pengajuan = ?',
        [PENGAJUAN_STATUS.CANCELLED, catatan, id],
      );
      await this.insertHistory(
        connection,
        id,
        previousStatus,
        PENGAJUAN_STATUS.CANCELLED,
        'PEMINJAM',
        idUser,
        catatan,
      );

      await connection.commit();
      return { outcome: 'CANCELLED', request };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async insertHistory(
    connection: PoolConnection,
    idPengajuan: number,
    from: string | null,
    to: string,
    actorType: string,
    actorId: number | null,
    note: string | null,
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO request_status_history
         (id_pengajuan, from_status, to_status, actor_type, actor_id, note)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [idPengajuan, from, to, actorType, actorId, note] satisfies SqlParam[],
    );
  }
}
