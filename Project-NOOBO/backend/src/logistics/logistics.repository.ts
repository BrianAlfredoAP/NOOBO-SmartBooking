import { Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  RowDataPacket,
} from 'mysql2/promise.js';
import { combineDateTime } from '../common/datetime.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { AlokasiLogistik } from '../entities/logistics/alokasi-logistik.entity.js';
import { AlokasiRuangan } from '../entities/logistics/alokasi-ruangan.entity.js';
import { KeputusanLogistik } from '../entities/workflow/keputusan-logistik.entity.js';
import { PENGAJUAN_STATUS } from '../entities/workflow/pengajuan-status.js';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';

export interface LogisticsDecisionInput {
  keputusan: 'APPROVE' | 'REVISION' | 'REJECT';
  alasan?: string;
}

export interface PlannedAllocation {
  rooms: Array<{ id_ruangan: number; mulai: Date; selesai: Date }>;
  logistics: Array<{
    id_logistik: number;
    jumlah: number;
    mulai: Date;
    selesai: Date;
  }>;
}

export interface AvailabilityIssue {
  type: 'ROOM_CONFLICT' | 'STOCK_INSUFFICIENT';
  id_ruangan?: number;
  nama_ruangan?: string;
  id_logistik?: number;
  nama_logistik?: string;
  diminta?: number;
  tersedia?: number;
}

export type LogisticsDecisionOutcome =
  | {
      outcome: 'OK';
      previous_status: string;
      status: string;
      id_user: number;
      nama_kegiatan: string;
    }
  | { outcome: 'NOT_FOUND' }
  | { outcome: 'NOT_PENDING'; status: string }
  | { outcome: 'UNAVAILABLE'; issues: AvailabilityIssue[] };

const ACTIVE_ALLOCATION = "status_alokasi NOT IN ('RELEASED', 'CANCELLED')";

@Injectable()
export class LogisticsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  /** Rencana alokasi dari paket terpilih pada rentang jadwal kegiatan. */
  async planForRequest(
    idPaket: number | null,
    mulai: Date,
    selesai: Date,
    connection?: PoolConnection,
  ): Promise<PlannedAllocation> {
    if (!idPaket) return { rooms: [], logistics: [] };
    const db = connection ?? this.pool;
    const [roomRows] = await db.execute<RowDataPacket[]>(
      `SELECT id_ruangan FROM paket_ruangan
       WHERE id_paket = ?
       ORDER BY id_ruangan ASC`,
      [idPaket],
    );
    const [itemRows] = await db.execute<RowDataPacket[]>(
      `SELECT id_logistik, jumlah FROM paket_logistik
       WHERE id_paket = ?
       ORDER BY id_logistik ASC`,
      [idPaket],
    );
    return {
      rooms: roomRows.map((row) => ({
        id_ruangan: Number(row.id_ruangan),
        mulai,
        selesai,
      })),
      logistics: itemRows.map((row) => ({
        id_logistik: Number(row.id_logistik),
        jumlah: Number(row.jumlah),
        mulai,
        selesai,
      })),
    };
  }

  /**
   * Cek ketersediaan terkini tanpa mengunci (dipakai GET detail). Alokasi milik
   * pengajuan itu sendiri diabaikan agar mengulang cek tidak memicu bentrok palsu.
   */
  async checkAvailability(
    idPengajuan: number,
    plan: PlannedAllocation,
  ): Promise<AvailabilityIssue[]> {
    const connection = await this.pool.getConnection();
    try {
      return await this.collectIssues(connection, idPengajuan, plan);
    } finally {
      connection.release();
    }
  }

  /**
   * Keputusan Logistik. Untuk APPROVE, pengecekan ulang dan penguncian
   * ketersediaan berjalan dalam satu transaksi (NFR-09/10):
   * row lock pada baris master ruangan/logistik memberi mutual exclusion
   * deterministik meski belum ada alokasi pada rentang waktu tersebut.
   */
  async decide(
    id: number,
    idUserLogistik: number,
    input: LogisticsDecisionInput,
  ): Promise<LogisticsDecisionOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT p.*, sk.id_user, sk.nama_kegiatan, sk.tanggal_mulai,
                sk.tanggal_selesai, sk.waktu_mulai, sk.waktu_selesai
         FROM pengajuan_peminjaman p
         JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
         WHERE p.id_pengajuan = ?
         LIMIT 1 FOR UPDATE`,
        [id],
      );
      const row = rows[0];
      if (!row) {
        await connection.rollback();
        return { outcome: 'NOT_FOUND' };
      }

      const request = PengajuanPeminjaman.fromRow(row);
      if (
        request.status !== PENGAJUAN_STATUS.WAITING_LOGISTIK &&
        request.status !== PENGAJUAN_STATUS.REVISION_LOGISTIK
      ) {
        await connection.rollback();
        return { outcome: 'NOT_PENDING', status: request.status };
      }

      const mulai = combineDateTime(row.tanggal_mulai, row.waktu_mulai);
      const selesai = combineDateTime(row.tanggal_selesai, row.waktu_selesai);
      const idPaket = row.id_paket == null ? null : Number(row.id_paket);
      const plan = await this.planForRequest(
        idPaket,
        mulai,
        selesai,
        connection,
      );

      if (input.keputusan === 'APPROVE') {
        if (!(await this.lockAvailability(connection, plan))) {
          await connection.rollback();
          return { outcome: 'NOT_FOUND' };
        }
        const issues = await this.collectIssues(connection, id, plan);
        if (issues.length > 0) {
          await connection.rollback();
          return { outcome: 'UNAVAILABLE', issues };
        }
      }

      const nextStatus =
        input.keputusan === 'APPROVE'
          ? PENGAJUAN_STATUS.APPROVED_LOGISTIK
          : input.keputusan === 'REVISION'
            ? PENGAJUAN_STATUS.REVISION_LOGISTIK
            : PENGAJUAN_STATUS.REJECTED_LOGISTIK;

      const keputusan = new KeputusanLogistik(0, id, idUserLogistik);
      if (input.keputusan === 'APPROVE') keputusan.approve();
      else if (input.keputusan === 'REVISION') {
        keputusan.update('REVISION', input.alasan ?? '');
      } else keputusan.reject(input.alasan);

      await connection.execute(
        `INSERT INTO keputusan_logistik
           (id_pengajuan, id_user_logistik, keputusan, alasan)
         VALUES (?, ?, ?, ?)`,
        [id, idUserLogistik, keputusan.keputusan, keputusan.alasan || null],
      );

      if (input.keputusan === 'APPROVE') {
        for (const room of plan.rooms) {
          const allocation = new AlokasiRuangan(
            0,
            id,
            room.id_ruangan,
            room.mulai,
            room.selesai,
            'ALLOCATED',
          );
          await connection.execute(
            `INSERT INTO alokasi_ruangan
               (id_pengajuan, id_ruangan, tanggal_mulai, tanggal_selesai, status_alokasi)
             VALUES (?, ?, ?, ?, ?)`,
            [
              id,
              room.id_ruangan,
              room.mulai,
              room.selesai,
              allocation.status_alokasi,
            ],
          );
        }
        for (const item of plan.logistics) {
          const allocation = new AlokasiLogistik(
            0,
            id,
            item.id_logistik,
            item.jumlah,
            item.mulai,
            item.selesai,
            'ALLOCATED',
          );
          await connection.execute(
            `INSERT INTO alokasi_logistik
               (id_pengajuan, id_logistik, jumlah_dialokasikan,
                tanggal_mulai, tanggal_selesai, status_alokasi)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              id,
              item.id_logistik,
              allocation.jumlah_dialokasikan,
              item.mulai,
              item.selesai,
              allocation.status_alokasi,
            ],
          );
        }
      }

      await connection.execute(
        `UPDATE pengajuan_peminjaman
         SET status = ?, alasan_penolakan = ?, catatan_logistik = ?
         WHERE id_pengajuan = ?`,
        [
          nextStatus,
          input.keputusan === 'REJECT' ? (input.alasan ?? null) : null,
          input.alasan ?? null,
          id,
        ],
      );

      await this.insertHistory(
        connection,
        id,
        request.status,
        nextStatus,
        'LOGISTIK',
        idUserLogistik,
        input.alasan ?? null,
      );

      await connection.commit();
      return {
        outcome: 'OK',
        previous_status: request.status,
        status: nextStatus,
        id_user: Number(row.id_user),
        nama_kegiatan: String(row.nama_kegiatan),
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Kunci baris master ruangan & logistik yang dipakai paket, dengan urutan id
   * menaik untuk mencegah deadlock antar transaksi bersamaan.
   */
  private async lockAvailability(
    connection: PoolConnection,
    plan: PlannedAllocation,
  ): Promise<boolean> {
    const roomIds = [...new Set(plan.rooms.map((room) => room.id_ruangan))].sort(
      (a, b) => a - b,
    );
    const itemIds = [
      ...new Set(plan.logistics.map((item) => item.id_logistik)),
    ].sort((a, b) => a - b);

    for (const idRuangan of roomIds) {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_ruangan FROM ruangan WHERE id_ruangan = ? LIMIT 1 FOR UPDATE',
        [idRuangan],
      );
      if (!rows[0]) return false;
    }
    for (const idLogistik of itemIds) {
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_logistik FROM logistik WHERE id_logistik = ? LIMIT 1 FOR UPDATE',
        [idLogistik],
      );
      if (!rows[0]) return false;
    }
    return true;
  }

  private async collectIssues(
    connection: PoolConnection,
    idPengajuan: number,
    plan: PlannedAllocation,
  ): Promise<AvailabilityIssue[]> {
    const issues: AvailabilityIssue[] = [];

    for (const room of plan.rooms) {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT r.nama_ruangan
         FROM alokasi_ruangan a
         JOIN ruangan r ON r.id_ruangan = a.id_ruangan
         WHERE a.id_ruangan = ?
           AND a.id_pengajuan <> ?
           AND ${ACTIVE_ALLOCATION}
           AND a.tanggal_mulai < ?
           AND a.tanggal_selesai > ?
         LIMIT 1`,
        [room.id_ruangan, idPengajuan, room.selesai, room.mulai],
      );
      if (rows[0]) {
        issues.push({
          type: 'ROOM_CONFLICT',
          id_ruangan: room.id_ruangan,
          nama_ruangan: String(rows[0].nama_ruangan),
        });
      }
    }

    for (const item of plan.logistics) {
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT l.nama_logistik, l.stok_total,
                COALESCE(SUM(a.jumlah_dialokasikan), 0) AS terpakai
         FROM logistik l
         LEFT JOIN alokasi_logistik a
           ON a.id_logistik = l.id_logistik
          AND a.id_pengajuan <> ?
          AND ${ACTIVE_ALLOCATION}
          AND a.tanggal_mulai < ?
          AND a.tanggal_selesai > ?
         WHERE l.id_logistik = ?
         GROUP BY l.id_logistik, l.nama_logistik, l.stok_total`,
        [idPengajuan, item.selesai, item.mulai, item.id_logistik],
      );
      const row = rows[0];
      if (!row) {
        issues.push({
          type: 'STOCK_INSUFFICIENT',
          id_logistik: item.id_logistik,
        });
        continue;
      }
      const tersedia = Math.max(0, Number(row.stok_total) - Number(row.terpakai));
      if (tersedia < item.jumlah) {
        issues.push({
          type: 'STOCK_INSUFFICIENT',
          id_logistik: item.id_logistik,
          nama_logistik: String(row.nama_logistik),
          diminta: item.jumlah,
          tersedia,
        });
      }
    }

    return issues;
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
