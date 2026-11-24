import { Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { PENGAJUAN_STATUS } from '../entities/workflow/pengajuan-status.js';
import { Sbp } from '../entities/workflow/sbp.entity.js';
import type { SbpDocumentData } from './sbp-document.js';

export interface SbpContext {
  id_pengajuan: number;
  id_user: number;
  status: string;
  nomor_pengajuan: string;
  nama_kegiatan: string;
  tujuan_kegiatan: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  waktu_mulai: string;
  waktu_selesai: string;
  jumlah_peserta: number;
  nama_peminjam: string;
  email_peminjam: string;
  whatsapp: string;
  nama_pembina: string;
  existing_sbp: {
    id_sbp: number;
    nomor_sbp: string;
    lokasi_dokumen: string;
    tanggal_terbit: Date;
  } | null;
}

export type IssueOutcome =
  | { outcome: 'OK'; id_sbp: number; nomor_sbp: string; lokasi_dokumen: string; tanggal_terbit: Date }
  | { outcome: 'NOT_FOUND' }
  | { outcome: 'APPROVAL_INCOMPLETE'; status: string }
  | { outcome: 'EXISTS'; nomor_sbp: string; lokasi_dokumen: string };

export interface DocumentLocation {
  id_sbp: number;
  id_pengajuan: number;
  id_user: number;
  nomor_sbp: string;
  lokasi_dokumen: string;
}

@Injectable()
export class SbpRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findContext(id: number): Promise<SbpContext | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT p.id_pengajuan, p.status, p.nomor_pengajuan,
              sk.id_user, sk.nama_kegiatan, sk.tujuan_kegiatan,
              sk.tanggal_mulai, sk.tanggal_selesai, sk.waktu_mulai,
              sk.waktu_selesai, sk.jumlah_peserta,
              u.nama AS nama_peminjam, u.email AS email_peminjam,
              COALESCE(u.whatsapp, '') AS whatsapp,
              COALESCE(pb.nama_pembina, '') AS nama_pembina,
              sbp.id_sbp, sbp.nomor_sbp, sbp.lokasi_dokumen, sbp.tanggal_terbit
       FROM pengajuan_peminjaman p
       JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
       JOIN users u ON u.id_user = sk.id_user
       LEFT JOIN pembina pb ON pb.id_pembina = p.id_pembina
       LEFT JOIN sbp ON sbp.id_pengajuan = p.id_pengajuan
       WHERE p.id_pengajuan = ?
       LIMIT 1`,
      [id],
    );
    const row = rows[0];
    if (!row) return null;

    return {
      id_pengajuan: Number(row.id_pengajuan),
      id_user: Number(row.id_user),
      status: String(row.status),
      nomor_pengajuan: String(row.nomor_pengajuan),
      nama_kegiatan: String(row.nama_kegiatan),
      tujuan_kegiatan: String(row.tujuan_kegiatan ?? ''),
      tanggal_mulai: toDate(row.tanggal_mulai),
      tanggal_selesai: toDate(row.tanggal_selesai),
      waktu_mulai: String(row.waktu_mulai),
      waktu_selesai: String(row.waktu_selesai),
      jumlah_peserta: Number(row.jumlah_peserta),
      nama_peminjam: String(row.nama_peminjam),
      email_peminjam: String(row.email_peminjam),
      whatsapp: String(row.whatsapp ?? ''),
      nama_pembina: String(row.nama_pembina ?? ''),
      existing_sbp:
        row.id_sbp == null
          ? null
          : {
              id_sbp: Number(row.id_sbp),
              nomor_sbp: String(row.nomor_sbp),
              lokasi_dokumen: String(row.lokasi_dokumen),
              tanggal_terbit: toDate(row.tanggal_terbit),
            },
    };
  }

  async findPackageContents(idPaket: number | null): Promise<{
    ruangan: string[];
    logistik: Array<{ nama: string; jumlah: number; satuan: string }>;
  }> {
    if (!idPaket) return { ruangan: [], logistik: [] };
    const [roomRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT r.nama_ruangan FROM paket_ruangan pr
       JOIN ruangan r ON r.id_ruangan = pr.id_ruangan
       WHERE pr.id_paket = ?
       ORDER BY r.nama_ruangan ASC`,
      [idPaket],
    );
    const [itemRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT l.nama_logistik, COALESCE(l.satuan, 'unit') AS satuan, pl.jumlah
       FROM paket_logistik pl
       JOIN logistik l ON l.id_logistik = pl.id_logistik
       WHERE pl.id_paket = ?
       ORDER BY pl.id_paket_logistik ASC`,
      [idPaket],
    );
    return {
      ruangan: roomRows.map((row) => String(row.nama_ruangan)),
      logistik: itemRows.map((row) => ({
        nama: String(row.nama_logistik),
        jumlah: Number(row.jumlah),
        satuan: String(row.satuan),
      })),
    };
  }

  async findIdPaket(idPengajuan: number): Promise<number | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT id_paket FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1',
      [idPengajuan],
    );
    const value = rows[0]?.id_paket;
    return value == null ? null : Number(value);
  }

  /**
   * Terbitkan SBP: validasi approval lengkap, simpan dokumen, dan set status
   * ONGOING dalam satu transaksi. Idempoten terhadap pengajuan yang sudah punya SBP.
   */
  async issue(
    id: number,
    idUserLogistik: number,
    nomorSbp: string,
    lokasiDokumen: string,
  ): Promise<IssueOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT * FROM pengajuan_peminjaman WHERE id_pengajuan = ? LIMIT 1 FOR UPDATE',
        [id],
      );
      const row = rows[0];
      if (!row) {
        await connection.rollback();
        return { outcome: 'NOT_FOUND' };
      }

      const status = String(row.status);
      if (status === PENGAJUAN_STATUS.ONGOING) {
        const [existing] = await connection.execute<RowDataPacket[]>(
          'SELECT nomor_sbp, lokasi_dokumen FROM sbp WHERE id_pengajuan = ? LIMIT 1',
          [id],
        );
        await connection.rollback();
        if (!existing[0]) return { outcome: 'APPROVAL_INCOMPLETE', status };
        return {
          outcome: 'EXISTS',
          nomor_sbp: String(existing[0].nomor_sbp),
          lokasi_dokumen: String(existing[0].lokasi_dokumen),
        };
      }

      if (status !== PENGAJUAN_STATUS.APPROVED_LOGISTIK) {
        await connection.rollback();
        return { outcome: 'APPROVAL_INCOMPLETE', status };
      }

      const [tokenRows] = await connection.execute<RowDataPacket[]>(
        `SELECT t.status, t.keputusan
         FROM token_keputusan t
         WHERE t.id_pengajuan = ?
         ORDER BY t.id_notifikasi DESC
         LIMIT 1`,
        [id],
      );
      const tokenDecision = tokenRows[0];
      if (!tokenDecision || String(tokenDecision.keputusan) !== 'APPROVE') {
        await connection.rollback();
        return { outcome: 'APPROVAL_INCOMPLETE', status };
      }

      const sbp = new Sbp(0, id, idUserLogistik, nomorSbp, new Date(), lokasiDokumen);
      const document = sbp.generate();
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO sbp (id_pengajuan, id_user_penerbit, nomor_sbp, tanggal_terbit, lokasi_dokumen)
         VALUES (?, ?, ?, ?, ?)`,
        [
          id,
          idUserLogistik,
          document.nomor_sbp,
          document.tanggal_terbit,
          document.lokasi_dokumen,
        ],
      );

      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
        [PENGAJUAN_STATUS.ONGOING, id],
      );
      await this.insertHistory(
        connection,
        id,
        PENGAJUAN_STATUS.APPROVED_LOGISTIK,
        PENGAJUAN_STATUS.ONGOING,
        idUserLogistik,
        `SBP diterbitkan: ${document.nomor_sbp}`,
      );

      await connection.commit();
      return {
        outcome: 'OK',
        id_sbp: result.insertId,
        nomor_sbp: document.nomor_sbp,
        lokasi_dokumen: document.lokasi_dokumen,
        tanggal_terbit: document.tanggal_terbit,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findDocument(
    id: number,
    idUser: number | null,
  ): Promise<DocumentLocation | null> {
    const params: SqlParam[] = [id];
    let ownerFilter = '';
    if (idUser != null) {
      ownerFilter = ' AND sk.id_user = ?';
      params.push(idUser);
    }
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT s.id_sbp, s.id_pengajuan, sk.id_user, s.nomor_sbp, s.lokasi_dokumen
       FROM sbp s
       JOIN pengajuan_peminjaman p ON p.id_pengajuan = s.id_pengajuan
       JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
       WHERE s.id_pengajuan = ?${ownerFilter}
       LIMIT 1`,
      params,
    );
    const row = rows[0];
    if (!row) return null;
    return {
      id_sbp: Number(row.id_sbp),
      id_pengajuan: Number(row.id_pengajuan),
      id_user: Number(row.id_user),
      nomor_sbp: String(row.nomor_sbp),
      lokasi_dokumen: String(row.lokasi_dokumen),
    };
  }

  private async insertHistory(
    connection: PoolConnection,
    idPengajuan: number,
    from: string,
    to: string,
    actorId: number | null,
    note: string,
  ): Promise<void> {
    await connection.execute(
      `INSERT INTO request_status_history
         (id_pengajuan, from_status, to_status, actor_type, actor_id, note)
       VALUES (?, ?, ?, 'LOGISTIK', ?, ?)`,
      [idPengajuan, from, to, actorId, note] satisfies SqlParam[],
    );
  }
}

export type { SbpDocumentData };

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
