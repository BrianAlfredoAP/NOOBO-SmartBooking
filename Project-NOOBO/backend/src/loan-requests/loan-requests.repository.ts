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
import { DetailPengembalian } from '../entities/workflow/detail-pengembalian.entity.js';
import { HasilPemeriksaan } from '../entities/workflow/hasil-pemeriksaan.entity.js';
import { Pembina } from '../entities/workflow/pembina.entity.js';
import { PENGAJUAN_STATUS } from '../entities/workflow/pengajuan-status.js';
import { PengajuanPeminjaman } from '../entities/workflow/pengajuan-peminjaman.entity.js';
import { Sbpg } from '../entities/workflow/sbpg.entity.js';
import { TemuanPemeriksaan } from '../entities/workflow/temuan-pemeriksaan.entity.js';

const TERMINAL_PLACEHOLDERS = TERMINAL_REQUEST_STATUSES.map(() => '?').join(', ');

function toDateString(value: unknown): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String((value as string | number) ?? '').slice(0, 10);
}

function normalizeTime(value: unknown): string {
  const raw = String((value as string | number) ?? '00:00');
  const match = /^(\d{1,2}):(\d{2})/.exec(raw);
  if (!match) return '00:00';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function combineDateTime(dateValue: unknown, timeValue: unknown): Date {
  const dateStr = toDateString(dateValue);
  const date = new Date(`${dateStr}T${normalizeTime(timeValue)}:00`);
  return Number.isNaN(date.getTime()) ? new Date(dateStr) : date;
}

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

export interface LoanRequestFilter {
  status?: string;
  idUser?: number | null;
  from?: string;
  to?: string;
  q?: string;
  page: number;
  limit: number;
}

export interface SubmitReturnInput {
  catatan?: string;
  foto_kerusakan?: string;
  items: Array<{
    id_alokasi_ruangan?: number;
    id_alokasi_logistik?: number;
    jumlah_dikembalikan: number;
    kondisi_kembali: string;
    catatan?: string;
  }>;
}

export interface InspectionInput {
  catatan?: string;
  temuan?: Array<{
    id_logistik?: number;
    id_ruangan?: number;
    jenis_temuan: string;
    jumlah: number;
    deskripsi: string;
    foto_bukti?: string;
  }>;
}

export type LifecycleOutcome =
  | { outcome: 'OK'; data: Record<string, unknown> }
  | { outcome: 'NOT_FOUND' }
  | { outcome: 'NOT_OWNER' }
  | { outcome: 'INVALID_STATUS'; status: string }
  | { outcome: 'INVALID_ITEMS'; errors: string[] };

const REQUEST_SELECT = `
  p.id_pengajuan, p.id_fsk, p.id_paket, p.id_pembina, p.email_pembina,
  p.nomor_pengajuan, p.tanggal_pengajuan, p.status, p.catatan,
  p.alasan_penolakan, p.catatan_logistik,
  sk.id_user, sk.nama_kegiatan, sk.tanggal_mulai, sk.tanggal_selesai,
  sk.waktu_mulai, sk.waktu_selesai, sk.jumlah_peserta, sk.tujuan_kegiatan,
  u.nama AS borrower_nama, u.email AS borrower_email, u.whatsapp,
  pr.nama_paket,
  sbp.id_sbp, sbp.nomor_sbp, sbp.tanggal_terbit, sbp.lokasi_dokumen,
  sbpg.id_sbpg, sbpg.waktu_kirim, sbpg.batas_waktu_kirim,
  sbpg.status_ketepatan_waktu, sbpg.catatan_peminjam,
  kl.keputusan AS keputusan_logistik, kl.alasan AS alasan_logistik,
  kl.waktu_keputusan
`;

const REQUEST_FROM = `
  FROM pengajuan_peminjaman p
  JOIN spesifikasi_kebutuhan sk ON sk.id_fsk = p.id_fsk
  JOIN users u ON u.id_user = sk.id_user
  LEFT JOIN paket_rekomendasi pr ON pr.id_paket = p.id_paket
  LEFT JOIN sbp ON sbp.id_pengajuan = p.id_pengajuan
  LEFT JOIN sbpg ON sbpg.id_pengajuan = p.id_pengajuan
  LEFT JOIN keputusan_logistik kl ON kl.id_keputusan_logistik = (
    SELECT MAX(k2.id_keputusan_logistik)
    FROM keputusan_logistik k2
    WHERE k2.id_pengajuan = p.id_pengajuan
  )
`;

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

  async findMany(
    filter: LoanRequestFilter,
  ): Promise<{ rows: RowDataPacket[]; total: number }> {
    const conditions: string[] = [];
    const params: SqlParam[] = [];
    if (filter.idUser != null) {
      conditions.push('sk.id_user = ?');
      params.push(filter.idUser);
    }
    if (filter.status) {
      conditions.push('p.status = ?');
      params.push(filter.status);
    }
    if (filter.from) {
      conditions.push('sk.tanggal_mulai >= ?');
      params.push(filter.from);
    }
    if (filter.to) {
      conditions.push('sk.tanggal_selesai <= ?');
      params.push(filter.to);
    }
    if (filter.q?.trim()) {
      const like = `%${filter.q.trim()}%`;
      conditions.push(
        '(p.nomor_pengajuan LIKE ? OR sk.nama_kegiatan LIKE ? OR u.nama LIKE ?)',
      );
      params.push(like, like, like);
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const [countRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) AS total ${REQUEST_FROM} ${where}`,
      params,
    );
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT ${REQUEST_SELECT} ${REQUEST_FROM} ${where}
       ORDER BY p.tanggal_pengajuan DESC, p.id_pengajuan DESC
       LIMIT ? OFFSET ?`,
      [...params, filter.limit, (filter.page - 1) * filter.limit],
    );
    return { rows, total: Number(countRows[0].total) };
  }

  async findDetail(
    id: number,
    idUser: number | null = null,
  ): Promise<RowDataPacket | null> {
    const conditions = ['p.id_pengajuan = ?'];
    const params: SqlParam[] = [id];
    if (idUser != null) {
      conditions.push('sk.id_user = ?');
      params.push(idUser);
    }
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT ${REQUEST_SELECT} ${REQUEST_FROM}
       WHERE ${conditions.join(' AND ')}
       LIMIT 1`,
      params,
    );
    return rows[0] ?? null;
  }

  async listOngoing(): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT ${REQUEST_SELECT} ${REQUEST_FROM}
       WHERE p.status = ?
       ORDER BY p.tanggal_pengajuan ASC, p.id_pengajuan ASC`,
      [PENGAJUAN_STATUS.ONGOING],
    );
    return rows;
  }

  async findPackageLines(idPaket: number | null): Promise<{
    room: RowDataPacket | null;
    logistics: RowDataPacket[];
  }> {
    if (!idPaket) return { room: null, logistics: [] };
    const [roomRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT r.* FROM paket_ruangan pr
       JOIN ruangan r ON r.id_ruangan = pr.id_ruangan
       WHERE pr.id_paket = ?
       LIMIT 1`,
      [idPaket],
    );
    const [logisticRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT l.*, pl.jumlah FROM paket_logistik pl
       JOIN logistik l ON l.id_logistik = pl.id_logistik
       WHERE pl.id_paket = ?
       ORDER BY pl.id_paket_logistik ASC`,
      [idPaket],
    );
    return { room: roomRows[0] ?? null, logistics: logisticRows };
  }

  async listHistory(id: number): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT from_status, to_status, actor_type, actor_id, note, at
       FROM request_status_history
       WHERE id_pengajuan = ?
       ORDER BY at ASC, id ASC`,
      [id],
    );
    return rows;
  }

  async listAllocations(idPengajuan: number): Promise<{
    rooms: RowDataPacket[];
    items: RowDataPacket[];
  }> {
    const [rooms] = await this.pool.execute<RowDataPacket[]>(
      `SELECT a.id_alokasi_ruangan, a.id_ruangan, r.nama_ruangan, r.kode_ruangan
       FROM alokasi_ruangan a
       JOIN ruangan r ON r.id_ruangan = a.id_ruangan
       WHERE a.id_pengajuan = ?
       ORDER BY a.id_alokasi_ruangan ASC`,
      [idPengajuan],
    );
    const [items] = await this.pool.execute<RowDataPacket[]>(
      `SELECT a.id_alokasi_logistik, a.id_logistik, l.nama_logistik, l.satuan,
              a.jumlah_dialokasikan
       FROM alokasi_logistik a
       JOIN logistik l ON l.id_logistik = a.id_logistik
       WHERE a.id_pengajuan = ?
       ORDER BY a.id_alokasi_logistik ASC`,
      [idPengajuan],
    );
    return { rooms, items };
  }

  async listReturnDetails(idPengajuan: number): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT d.*,
              al.id_logistik, l.nama_logistik, l.satuan, al.jumlah_dialokasikan AS jumlah_dipinjam,
              ar.id_ruangan, r.nama_ruangan
       FROM detail_pengembalian d
       JOIN sbpg s ON s.id_sbpg = d.id_sbpg
       LEFT JOIN alokasi_logistik al ON al.id_alokasi_logistik = d.id_alokasi_logistik
       LEFT JOIN logistik l ON l.id_logistik = al.id_logistik
       LEFT JOIN alokasi_ruangan ar ON ar.id_alokasi_ruangan = d.id_alokasi_ruangan
       LEFT JOIN ruangan r ON r.id_ruangan = ar.id_ruangan
       WHERE s.id_pengajuan = ?
       ORDER BY d.id_detail_pengembalian ASC`,
      [idPengajuan],
    );
    return rows;
  }

  async submitReturn(
    id: number,
    idUser: number,
    input: SubmitReturnInput,
  ): Promise<LifecycleOutcome> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.execute<RowDataPacket[]>(
        `SELECT p.*, sk.id_user, sk.tanggal_selesai, sk.waktu_selesai
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
      if (Number(row.id_user) !== idUser) {
        await connection.rollback();
        return { outcome: 'NOT_OWNER' };
      }
      const status = String(row.status);
      if (status !== 'ONGOING') {
        await connection.rollback();
        return { outcome: 'INVALID_STATUS', status };
      }

      const [roomRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_alokasi_ruangan FROM alokasi_ruangan WHERE id_pengajuan = ?',
        [id],
      );
      const [itemRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_alokasi_logistik, jumlah_dialokasikan FROM alokasi_logistik WHERE id_pengajuan = ?',
        [id],
      );
      const roomIds = new Set(roomRows.map((r) => Number(r.id_alokasi_ruangan)));
      const itemLimits = new Map(
        itemRows.map((r) => [
          Number(r.id_alokasi_logistik),
          Number(r.jumlah_dialokasikan),
        ]),
      );

      const itemErrors: string[] = [];
      for (const [idx, item] of input.items.entries()) {
        const hasRoom = item.id_alokasi_ruangan != null;
        const hasLogistic = item.id_alokasi_logistik != null;
        if (hasRoom === hasLogistic) {
          itemErrors.push(
            `Item #${idx + 1} wajib memilih salah satu id_alokasi_ruangan atau id_alokasi_logistik`,
          );
          continue;
        }
        const detail = new DetailPengembalian(
          0,
          1,
          item.id_alokasi_ruangan ?? 0,
          item.id_alokasi_logistik ?? 0,
          item.jumlah_dikembalikan,
          item.kondisi_kembali,
          item.catatan ?? '',
        );
        if (!detail.validate() || !detail.addDetail()) {
          itemErrors.push(`Item #${idx + 1} tidak valid`);
          continue;
        }
        if (hasRoom) {
          if (roomIds.size > 0 && !roomIds.has(Number(item.id_alokasi_ruangan))) {
            itemErrors.push(
              `Alokasi ruangan ${item.id_alokasi_ruangan} bukan milik pengajuan ini`,
            );
          } else if (item.jumlah_dikembalikan < 0 || item.jumlah_dikembalikan > 1) {
            itemErrors.push(
              `Jumlah kembali ruangan harus antara 0 dan 1 (diterima: ${item.jumlah_dikembalikan})`,
            );
          }
        } else if (hasLogistic) {
          const borrowed = itemLimits.get(Number(item.id_alokasi_logistik));
          if (itemLimits.size > 0 && borrowed === undefined) {
            itemErrors.push(
              `Alokasi logistik ${item.id_alokasi_logistik} bukan milik pengajuan ini`,
            );
          } else if (
            borrowed !== undefined &&
            (item.jumlah_dikembalikan < 0 || item.jumlah_dikembalikan > borrowed)
          ) {
            itemErrors.push(
              `Jumlah dikembalikan (${item.jumlah_dikembalikan}) melebihi jumlah dipinjam (${borrowed})`,
            );
          }
        }
      }

      if (itemErrors.length > 0) {
        await connection.rollback();
        return { outcome: 'INVALID_ITEMS', errors: itemErrors };
      }

      const batas = new Date(
        combineDateTime(row.tanggal_selesai, row.waktu_selesai).getTime() +
          60 * 60 * 1000,
      );
      const sbpg = new Sbpg(0, id, batas, new Date(), 'TEPAT_WAKTU', input.catatan ?? '');
      if (input.foto_kerusakan) sbpg.uploadFoto(input.foto_kerusakan);
      sbpg.generate();
      const waktuKirim = sbpg.waktu_kirim;
      const ketepatan = sbpg.status_ketepatan_waktu;
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO sbpg
           (id_pengajuan, batas_waktu_kirim, waktu_kirim, status_ketepatan_waktu,
            catatan_peminjam, foto_kerusakan)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          batas,
          waktuKirim,
          ketepatan,
          input.catatan ?? null,
          input.foto_kerusakan ?? null,
        ],
      );
      const idSbpg = result.insertId;
      for (const item of input.items) {
        await connection.execute(
          `INSERT INTO detail_pengembalian
             (id_sbpg, id_alokasi_ruangan, id_alokasi_logistik,
              jumlah_dikembalikan, kondisi_kembali, catatan)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            idSbpg,
            item.id_alokasi_ruangan ?? null,
            item.id_alokasi_logistik ?? null,
            item.jumlah_dikembalikan,
            item.kondisi_kembali,
            item.catatan ?? null,
          ],
        );
      }
      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
        ['RETURN_REPORTED', id],
      );
      await this.insertHistory(
        connection,
        id,
        'ONGOING',
        'RETURN_REPORTED',
        'PEMINJAM',
        idUser,
        input.catatan ?? null,
      );
      await connection.commit();
      return {
        outcome: 'OK',
        data: {
          id_sbpg: idSbpg,
          status: 'RETURN_REPORTED',
          status_ketepatan_waktu: ketepatan,
          is_late: ketepatan === 'TERLAMBAT',
          batas_waktu_kirim: batas,
          waktu_kirim: waktuKirim,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findInspection(idPengajuan: number): Promise<{
    hasil: RowDataPacket | null;
    temuan: RowDataPacket[];
  }> {
    const [hasilRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM hasil_pemeriksaan
       WHERE id_pengajuan = ?
       ORDER BY id_hasil_pemeriksaan DESC
       LIMIT 1`,
      [idPengajuan],
    );
    const hasil = hasilRows[0] ?? null;
    if (!hasil) return { hasil: null, temuan: [] };
    const [temuan] = await this.pool.execute<RowDataPacket[]>(
      `SELECT t.*, l.nama_logistik, r.nama_ruangan
       FROM temuan_pemeriksaan t
       LEFT JOIN logistik l ON l.id_logistik = t.id_logistik
       LEFT JOIN ruangan r ON r.id_ruangan = t.id_ruangan
       WHERE t.id_hasil_pemeriksaan = ?
       ORDER BY t.id_temuan ASC`,
      [Number(hasil.id_hasil_pemeriksaan)],
    );
    return { hasil, temuan };
  }

  async recordInspection(
    id: number,
    idUserLogistik: number,
    input: InspectionInput,
  ): Promise<LifecycleOutcome> {
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
      if (status !== 'RETURN_REPORTED') {
        await connection.rollback();
        return { outcome: 'INVALID_STATUS', status };
      }
      const [sbpgRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_sbpg FROM sbpg WHERE id_pengajuan = ? LIMIT 1',
        [id],
      );
      if (!sbpgRows[0]) {
        await connection.rollback();
        return { outcome: 'INVALID_STATUS', status };
      }
      const idSbpg = Number(sbpgRows[0].id_sbpg);

      const hasilEntity = new HasilPemeriksaan(
        0,
        id,
        idSbpg,
        idUserLogistik,
        new Date(),
        'IN_PROGRESS',
        input.catatan ?? '',
      );
      hasilEntity.inspect();

      const [existingRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id_hasil_pemeriksaan FROM hasil_pemeriksaan
         WHERE id_pengajuan = ?
         ORDER BY id_hasil_pemeriksaan DESC
         LIMIT 1`,
        [id],
      );
      let idHasil: number;
      if (existingRows[0]) {
        idHasil = Number(existingRows[0].id_hasil_pemeriksaan);
        await connection.execute(
          `UPDATE hasil_pemeriksaan
           SET id_user_pemeriksa = ?, status_pemeriksaan = ?, catatan = ?, waktu_pemeriksaan = NOW()
           WHERE id_hasil_pemeriksaan = ?`,
          [
            idUserLogistik,
            hasilEntity.status_pemeriksaan,
            input.catatan ?? null,
            idHasil,
          ],
        );
        await connection.execute(
          'DELETE FROM temuan_pemeriksaan WHERE id_hasil_pemeriksaan = ?',
          [idHasil],
        );
      } else {
        const [inserted] = await connection.execute<ResultSetHeader>(
          `INSERT INTO hasil_pemeriksaan
             (id_pengajuan, id_sbpg, id_user_pemeriksa, status_pemeriksaan, catatan)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            idSbpg,
            idUserLogistik,
            hasilEntity.status_pemeriksaan,
            input.catatan ?? null,
          ],
        );
        idHasil = inserted.insertId;
      }

      for (const temuan of input.temuan ?? []) {
        const temuanEntity = new TemuanPemeriksaan(
          0,
          idHasil,
          temuan.id_logistik ?? 0,
          temuan.id_ruangan ?? 0,
          temuan.jenis_temuan,
          temuan.jumlah,
          temuan.deskripsi,
          temuan.foto_bukti ?? '',
        );
        if (!temuanEntity.addTemuan()) continue;
        await connection.execute(
          `INSERT INTO temuan_pemeriksaan
             (id_hasil_pemeriksaan, id_logistik, id_ruangan, jenis_temuan, jumlah, deskripsi, foto_bukti)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            idHasil,
            temuan.id_logistik ?? null,
            temuan.id_ruangan ?? null,
            temuanEntity.jenis_temuan,
            temuanEntity.jumlah,
            temuanEntity.deskripsi,
            temuan.foto_bukti ?? null,
          ],
        );
      }

      await connection.commit();
      return {
        outcome: 'OK',
        data: {
          id_hasil_pemeriksaan: idHasil,
          status_pemeriksaan: hasilEntity.status_pemeriksaan,
          jumlah_temuan: (input.temuan ?? []).length,
        },
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async inspect(
    id: number,
    idUserLogistik: number,
    input: InspectionInput = {},
  ): Promise<LifecycleOutcome> {
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
      if (status !== 'RETURN_REPORTED') {
        await connection.rollback();
        return { outcome: 'INVALID_STATUS', status };
      }
      const [sbpgRows] = await connection.execute<RowDataPacket[]>(
        'SELECT id_sbpg FROM sbpg WHERE id_pengajuan = ? LIMIT 1',
        [id],
      );
      if (!sbpgRows[0]) {
        await connection.rollback();
        return { outcome: 'INVALID_STATUS', status };
      }
      const idSbpg = Number(sbpgRows[0].id_sbpg);

      const hasilEntity = new HasilPemeriksaan(
        0,
        id,
        idSbpg,
        idUserLogistik,
        new Date(),
        'IN_PROGRESS',
        input.catatan ?? '',
      );
      hasilEntity.complete();

      const [existingRows] = await connection.execute<RowDataPacket[]>(
        `SELECT id_hasil_pemeriksaan FROM hasil_pemeriksaan
         WHERE id_pengajuan = ?
         ORDER BY id_hasil_pemeriksaan DESC
         LIMIT 1`,
        [id],
      );

      let idHasil: number;
      let findingsToApply: NonNullable<InspectionInput['temuan']> =
        input.temuan ?? [];

      if (existingRows[0]) {
        idHasil = Number(existingRows[0].id_hasil_pemeriksaan);
        await connection.execute(
          `UPDATE hasil_pemeriksaan
           SET id_user_pemeriksa = ?, status_pemeriksaan = ?, catatan = COALESCE(?, catatan), waktu_pemeriksaan = NOW()
           WHERE id_hasil_pemeriksaan = ?`,
          [
            idUserLogistik,
            hasilEntity.status_pemeriksaan,
            input.catatan ?? null,
            idHasil,
          ],
        );
        if (input.temuan !== undefined) {
          await connection.execute(
            'DELETE FROM temuan_pemeriksaan WHERE id_hasil_pemeriksaan = ?',
            [idHasil],
          );
          for (const temuan of input.temuan) {
            await connection.execute(
              `INSERT INTO temuan_pemeriksaan
                 (id_hasil_pemeriksaan, id_logistik, id_ruangan, jenis_temuan, jumlah, deskripsi, foto_bukti)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                idHasil,
                temuan.id_logistik ?? null,
                temuan.id_ruangan ?? null,
                temuan.jenis_temuan,
                temuan.jumlah,
                temuan.deskripsi,
                temuan.foto_bukti ?? null,
              ],
            );
          }
        } else {
          const [storedTemuan] = await connection.execute<RowDataPacket[]>(
            'SELECT * FROM temuan_pemeriksaan WHERE id_hasil_pemeriksaan = ?',
            [idHasil],
          );
          findingsToApply = storedTemuan.map((t) => ({
            id_logistik: t.id_logistik != null ? Number(t.id_logistik) : undefined,
            id_ruangan: t.id_ruangan != null ? Number(t.id_ruangan) : undefined,
            jenis_temuan: String(t.jenis_temuan),
            jumlah: Number(t.jumlah),
            deskripsi: String(t.deskripsi ?? ''),
            foto_bukti: t.foto_bukti != null ? String(t.foto_bukti) : undefined,
          }));
        }
      } else {
        const [hasil] = await connection.execute<ResultSetHeader>(
          `INSERT INTO hasil_pemeriksaan
             (id_pengajuan, id_sbpg, id_user_pemeriksa, status_pemeriksaan, catatan)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            idSbpg,
            idUserLogistik,
            hasilEntity.status_pemeriksaan,
            input.catatan ?? null,
          ],
        );
        idHasil = hasil.insertId;
        for (const temuan of findingsToApply) {
          await connection.execute(
            `INSERT INTO temuan_pemeriksaan
               (id_hasil_pemeriksaan, id_logistik, id_ruangan, jenis_temuan, jumlah, deskripsi, foto_bukti)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              idHasil,
              temuan.id_logistik ?? null,
              temuan.id_ruangan ?? null,
              temuan.jenis_temuan,
              temuan.jumlah,
              temuan.deskripsi,
              temuan.foto_bukti ?? null,
            ],
          );
        }
      }

      let lostDeductions = 0;
      let damagedUpdates = 0;
      for (const temuan of findingsToApply) {
        const jenis = temuan.jenis_temuan.toUpperCase();
        if ((jenis === 'LOST' || jenis === 'HILANG') && temuan.id_logistik) {
          await connection.execute(
            'UPDATE logistik SET stok_total = GREATEST(0, stok_total - ?) WHERE id_logistik = ?',
            [temuan.jumlah, temuan.id_logistik],
          );
          lostDeductions += temuan.jumlah;
        } else if (jenis === 'DAMAGED' || jenis === 'RUSAK') {
          if (temuan.id_logistik) {
            await connection.execute(
              "UPDATE logistik SET kondisi_fasilitas = 'Rusak' WHERE id_logistik = ?",
              [temuan.id_logistik],
            );
            damagedUpdates += 1;
          }
          if (temuan.id_ruangan) {
            await connection.execute(
              "UPDATE ruangan SET kondisi_fasilitas = 'Rusak' WHERE id_ruangan = ?",
              [temuan.id_ruangan],
            );
            damagedUpdates += 1;
          }
        }
      }

      await connection.execute(
        `UPDATE alokasi_ruangan SET status_alokasi = 'RELEASED' WHERE id_pengajuan = ?`,
        [id],
      );
      await connection.execute(
        `UPDATE alokasi_logistik SET status_alokasi = 'RELEASED' WHERE id_pengajuan = ?`,
        [id],
      );
      await connection.execute(
        'UPDATE pengajuan_peminjaman SET status = ? WHERE id_pengajuan = ?',
        ['COMPLETED', id],
      );
      await this.insertHistory(
        connection,
        id,
        'RETURN_REPORTED',
        'COMPLETED',
        'LOGISTIK',
        idUserLogistik,
        input.catatan ?? null,
      );
      await connection.commit();
      return {
        outcome: 'OK',
        data: {
          id_hasil_pemeriksaan: idHasil,
          status: 'COMPLETED',
          jumlah_temuan: findingsToApply.length,
          lost_stock_deducted: lostDeductions,
          damaged_items_flagged: damagedUpdates,
        },
      };
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
