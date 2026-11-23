import { Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  RowDataPacket,
} from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { PENGAJUAN_STATUS } from '../entities/workflow/pengajuan-status.js';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';
import {
  TOKEN_STATUS,
  TokenKeputusan,
} from '../entities/workflow/token-keputusan.entity.js';

const TOKEN_CONTEXT_SELECT = `
  SELECT
    t.id_notifikasi, t.id_pengajuan, t.token_hash,
    t.dibuat_pada AS token_dibuat_pada, t.kedaluwarsa_pada,
    t.waktu_digunakan, t.status AS token_status,
    t.keputusan, t.alasan AS token_alasan,
    p.id_fsk, p.id_paket, p.id_pembina, p.email_pembina, p.id_aturan,
    p.setuju_syarat, p.waktu_setuju, p.nomor_pengajuan, p.tanggal_pengajuan,
    p.status AS pengajuan_status, p.catatan,
    sk.nama_kegiatan, sk.tanggal_mulai, sk.tanggal_selesai,
    sk.waktu_mulai, sk.waktu_selesai, sk.jumlah_peserta, sk.tujuan_kegiatan,
    u.id_user, u.nama AS nama_peminjam, u.email AS email_peminjam,
    pb.nama_pembina, pb.email_pembina AS email_pembina_master,
    pr.nama_paket, pr.skor, pr.alasan AS paket_alasan, pr.snapshot
  FROM token_keputusan t
  JOIN pengajuan_peminjaman p ON p.id_pengajuan = t.id_pengajuan
  JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
  JOIN users u ON u.id_user = sk.id_user
  LEFT JOIN pembina pb ON pb.id_pembina = p.id_pembina
  LEFT JOIN paket_rekomendasi pr ON pr.id_paket = p.id_paket
`;

export interface ApprovalContext {
  token: TokenKeputusan;
  request: PengajuanPeminjaman;
  fsk: {
    id_fsk: number;
    nama_kegiatan: string;
    tanggal_mulai: Date;
    tanggal_selesai: Date;
    waktu_mulai: string;
    waktu_selesai: string;
    jumlah_peserta: number;
    tujuan_kegiatan: string;
  };
  peminjam: { id_user: number; nama: string; email: string };
  pembina: { id_pembina: number | null; nama_pembina: string; email_pembina: string };
  paket: {
    id_paket: number | null;
    nama_paket: string | null;
    skor: number | null;
    alasan: string | null;
    snapshot: unknown;
  };
}

export type DecideOutcome =
  | { outcome: 'NOT_FOUND' }
  | {
      outcome: 'USED';
      keputusan: string | null;
      alasan: string | null;
      waktu_digunakan: Date | null;
    }
  | { outcome: 'EXPIRED' }
  | { outcome: 'NOT_PENDING'; status: string }
  | { outcome: 'DECIDED'; next_status: string };

export type ExpireOutcome = 'NOT_FOUND' | 'EXPIRED' | 'USED' | 'ACTIVE';

@Injectable()
export class ApprovalsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findByTokenHash(tokenHash: string): Promise<ApprovalContext | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `${TOKEN_CONTEXT_SELECT} WHERE t.token_hash = ? LIMIT 1`,
      [tokenHash],
    );
    const row = rows[0];
    return row ? mapContext(row) : null;
  }

  async expireIfNeeded(tokenHash: string): Promise<ExpireOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [tokenRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM token_keputusan WHERE token_hash = ? LIMIT 1 FOR UPDATE',
        [tokenHash],
      );
      const tokenRow = tokenRows[0];
      if (!tokenRow) {
        await connection.rollback();
        return 'NOT_FOUND';
      }

      const token = TokenKeputusan.fromRow(tokenRow);
      if (token.status === TOKEN_STATUS.USED) {
        await connection.rollback();
        return 'USED';
      }
      if (token.status === TOKEN_STATUS.EXPIRED) {
        await connection.rollback();
        return 'EXPIRED';
      }
      if (!token.isExpired()) {
        await connection.rollback();
        return 'ACTIVE';
      }

      await connection.execute(
        "UPDATE token_keputusan SET status = 'EXPIRED' WHERE token_hash = ?",
        [tokenHash],
      );
      await this.expireRequest(connection, token.id_pengajuan);
      await connection.commit();
      return 'EXPIRED';
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async decide(
    tokenHash: string,
    decision: 'APPROVE' | 'REJECT',
    reason: string | null,
  ): Promise<DecideOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [tokenRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM token_keputusan WHERE token_hash = ? LIMIT 1 FOR UPDATE',
        [tokenHash],
      );
      const tokenRow = tokenRows[0];
      if (!tokenRow) {
        await connection.rollback();
        return { outcome: 'NOT_FOUND' };
      }

      const token = TokenKeputusan.fromRow(tokenRow);
      if (token.status === TOKEN_STATUS.USED) {
        await connection.rollback();
        return {
          outcome: 'USED',
          keputusan: token.keputusan,
          alasan: token.alasan,
          waktu_digunakan: token.waktu_digunakan,
        };
      }
      if (token.status === TOKEN_STATUS.EXPIRED || token.isExpired()) {
        await connection.execute(
          "UPDATE token_keputusan SET status = 'EXPIRED' WHERE id_notifikasi = ?",
          [token.id_notifikasi],
        );
        await this.expireRequest(connection, token.id_pengajuan);
        await connection.commit();
        return { outcome: 'EXPIRED' };
      }

      const [requestRows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1 FOR UPDATE',
        [token.id_pengajuan],
      );
      const requestRow = requestRows[0];
      if (!requestRow) {
        await connection.rollback();
        return { outcome: 'NOT_FOUND' };
      }

      const request = PengajuanPeminjaman.fromRow(requestRow);
      const nextStatus =
        decision === 'APPROVE'
          ? PENGAJUAN_STATUS.WAITING_LOGISTIK
          : PENGAJUAN_STATUS.REJECTED_PEMBINA;
      if (!request.updateStatus(nextStatus)) {
        await connection.rollback();
        return { outcome: 'NOT_PENDING', status: request.status };
      }

      await connection.execute(
        `UPDATE token_keputusan
         SET waktu_digunakan = NOW(), status = 'USED', keputusan = ?, alasan = ?
         WHERE id_notifikasi = ?`,
        [decision, reason, token.id_notifikasi],
      );
      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
        [nextStatus, token.id_pengajuan],
      );
      await this.insertHistory(
        connection,
        token.id_pengajuan,
        PENGAJUAN_STATUS.WAITING_PEMBINA,
        nextStatus,
        'PEMBINA',
        request.id_pembina,
        decision === 'APPROVE' ? 'Disetujui Pembina' : (reason ?? 'Ditolak Pembina'),
      );

      await connection.commit();
      return { outcome: 'DECIDED', next_status: nextStatus };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async expireRequest(
    connection: PoolConnection,
    idPengajuan: number,
  ): Promise<void> {
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT * FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1 FOR UPDATE',
      [idPengajuan],
    );
    const row = rows[0];
    if (!row) return;

    const request = PengajuanPeminjaman.fromRow(row);
    if (!request.updateStatus(PENGAJUAN_STATUS.EXPIRED)) return;

    await connection.execute(
      'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
      [PENGAJUAN_STATUS.EXPIRED, idPengajuan],
    );
    await this.insertHistory(
      connection,
      idPengajuan,
      PENGAJUAN_STATUS.WAITING_PEMBINA,
      PENGAJUAN_STATUS.EXPIRED,
      'SYSTEM',
      null,
      'Tautan persetujuan kedaluwarsa',
    );
  }

  private async insertHistory(
    connection: PoolConnection,
    idPengajuan: number,
    from: string,
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

function mapContext(row: RowDataPacket): ApprovalContext {
  const token = new TokenKeputusan(
    Number(row.id_notifikasi),
    Number(row.id_pengajuan),
    String(row.token_hash),
    toDate(row.token_dibuat_pada),
    toDate(row.kedaluwarsa_pada),
    row.waktu_digunakan === null ? null : toDate(row.waktu_digunakan),
    String(row.token_status),
    row.keputusan === null ? null : String(row.keputusan),
    row.token_alasan === null ? null : String(row.token_alasan),
  );

  const request = PengajuanPeminjaman.fromRow({
    ...row,
    status: row.pengajuan_status,
  });

  return {
    token,
    request,
    fsk: {
      id_fsk: Number(row.id_fsk),
      nama_kegiatan: String(row.nama_kegiatan),
      tanggal_mulai: toDate(row.tanggal_mulai),
      tanggal_selesai: toDate(row.tanggal_selesai),
      waktu_mulai: String(row.waktu_mulai),
      waktu_selesai: String(row.waktu_selesai),
      jumlah_peserta: Number(row.jumlah_peserta),
      tujuan_kegiatan: String(row.tujuan_kegiatan),
    },
    peminjam: {
      id_user: Number(row.id_user),
      nama: String(row.nama_peminjam),
      email: String(row.email_peminjam),
    },
    pembina: {
      id_pembina:
        row.id_pembina === null || row.id_pembina === undefined
          ? null
          : Number(row.id_pembina),
      nama_pembina: String(row.nama_pembina ?? ''),
      email_pembina: String(row.email_pembina_master ?? row.email_pembina ?? ''),
    },
    paket: {
      id_paket:
        row.id_paket === null || row.id_paket === undefined
          ? null
          : Number(row.id_paket),
      nama_paket:
        row.nama_paket === null || row.nama_paket === undefined
          ? null
          : String(row.nama_paket),
      skor: row.skor === null || row.skor === undefined ? null : Number(row.skor),
      alasan:
        row.paket_alasan === null || row.paket_alasan === undefined
          ? null
          : String(row.paket_alasan),
      snapshot: parseSnapshot(row.snapshot),
    },
  };
}

function parseSnapshot(value: unknown): unknown {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
