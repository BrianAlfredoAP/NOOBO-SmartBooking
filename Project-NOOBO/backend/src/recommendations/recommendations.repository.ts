import { Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { Logistik } from '../entities/logistics/logistik.entity.js';
import { Ruangan } from '../entities/logistics/ruangan.entity.js';

export interface PackageDraft {
  nama_paket: string;
  skor: number;
  alasan: string;
  snapshot: unknown;
  id_ruangan: number;
  logistik: Array<{ id_logistik: number; jumlah: number }>;
}

export interface PackageView {
  id_paket: number;
  id_fsk: number;
  nama_paket: string;
  skor: number;
  alasan: string;
  snapshot: unknown;
  dipilih: boolean;
  dibuat_pada: Date;
  ruangan: Record<string, unknown> | null;
  logistik: Array<Record<string, unknown>>;
}

const CANDIDATE_LIMIT = 20;
const LOGISTIC_CANDIDATE_LIMIT = 5;

@Injectable()
export class RecommendationsRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async findCandidateRooms(
    jumlahPeserta: number,
    jenisKebutuhan?: string,
  ): Promise<Ruangan[]> {
    const params: SqlParam[] = [jumlahPeserta];
    let filter = '';
    if (jenisKebutuhan) {
      filter = ' AND (jenis = ? OR nama_ruangan LIKE ?)';
      params.push(jenisKebutuhan, `%${jenisKebutuhan}%`);
    }

    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM ruangan
       WHERE status_aktif = 1
         AND kondisi_fasilitas <> 'Rusak'
         AND kapasitas >= ?${filter}
       ORDER BY kapasitas ASC
       LIMIT ${CANDIDATE_LIMIT}`,
      params,
    );
    return rows.map((row) => Ruangan.fromRow(row));
  }

  async findLogisticCandidates(jenisKebutuhan: string): Promise<Logistik[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM logistik
       WHERE status_aktif = 1
         AND kondisi_fasilitas <> 'Rusak'
         AND (nama_logistik LIKE ? OR jenis = ?)
       ORDER BY stok_total DESC
       LIMIT ${LOGISTIC_CANDIDATE_LIMIT}`,
      [`%${jenisKebutuhan}%`, jenisKebutuhan],
    );
    return rows.map((row) => Logistik.fromRow(row));
  }

  async replacePackages(idFsk: number, drafts: PackageDraft[]): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        'DELETE FROM paket_rekomendasi WHERE id_fsk = ?',
        [idFsk],
      );

      for (const draft of drafts) {
        const [result] = await connection.execute<ResultSetHeader>(
          `INSERT INTO paket_rekomendasi
             (id_fsk, nama_paket, skor, alasan, snapshot, dipilih)
           VALUES (?, ?, ?, ?, ?, FALSE)`,
          [
            idFsk,
            draft.nama_paket,
            draft.skor,
            draft.alasan,
            JSON.stringify(draft.snapshot),
          ],
        );

        await connection.execute(
          'INSERT INTO paket_ruangan (id_paket, id_ruangan) VALUES (?, ?)',
          [result.insertId, draft.id_ruangan],
        );

        for (const item of draft.logistik) {
          await connection.execute(
            `INSERT INTO paket_logistik (id_paket, id_logistik, jumlah)
             VALUES (?, ?, ?)`,
            [result.insertId, item.id_logistik, item.jumlah],
          );
        }
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findByFsk(idFsk: number): Promise<PackageView[]> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM paket_rekomendasi
       WHERE id_fsk = ?
       ORDER BY skor DESC, id_paket ASC`,
      [idFsk],
    );

    const packages: PackageView[] = [];
    for (const row of rows) {
      packages.push(await this.hydrate(row));
    }
    return packages;
  }

  async findById(idFsk: number, idPaket: number): Promise<PackageView | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM paket_rekomendasi
       WHERE id_fsk = ? AND id_paket = ?
       LIMIT 1`,
      [idFsk, idPaket],
    );
    const row = rows[0];
    return row ? this.hydrate(row) : null;
  }

  async markSelected(idFsk: number, idPaket: number): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        'UPDATE paket_rekomendasi SET dipilih = FALSE WHERE id_fsk = ?',
        [idFsk],
      );
      await connection.execute(
        'UPDATE paket_rekomendasi SET dipilih = TRUE WHERE id_fsk = ? AND id_paket = ?',
        [idFsk, idPaket],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  private async hydrate(row: RowDataPacket): Promise<PackageView> {
    const idPaket = Number(row.id_paket);

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

    return {
      id_paket: idPaket,
      id_fsk: Number(row.id_fsk),
      nama_paket: String(row.nama_paket),
      skor: Number(row.skor),
      alasan: String(row.alasan),
      snapshot: parseSnapshot(row.snapshot),
      dipilih: Boolean(row.dipilih),
      dibuat_pada: new Date(row.dibuat_pada as string | Date),
      ruangan: roomRows[0]
        ? (Ruangan.fromRow(roomRows[0]).viewDetail() as Record<string, unknown>)
        : null,
      logistik: logisticRows.map((item) => ({
        ...(Logistik.fromRow(item).viewDetail() as Record<string, unknown>),
        jumlah: Number(item.jumlah),
      })),
    };
  }
}

function parseSnapshot(value: unknown): unknown {
  if (typeof value !== 'string') return value ?? null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}
