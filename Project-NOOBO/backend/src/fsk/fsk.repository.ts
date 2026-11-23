import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import type {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { DATABASE_POOL } from '../database/database.constants.js';
import type { SqlParam } from '../database/sql.types.js';
import { DetailKebutuhanFsk } from '../entities/fsk/detail-kebutuhan-fsk.entity.js';
import { SpesifikasiKebutuhan } from '../entities/fsk/spesifikasi-kebutuhan.entity.js';
import type { CreateFskDto, FskDetailDto, UpdateFskDto } from './dto/fsk.dto.js';

export interface FskRecord {
  fsk: SpesifikasiKebutuhan;
  details: DetailKebutuhanFsk[];
}

@Injectable()
export class FskRepository {
  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async create(idUser: number, dto: CreateFskDto): Promise<number> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute<ResultSetHeader>(
        `INSERT INTO spesifikasi_kebutuhan
           (id_user, nama_kegiatan, tanggal_mulai, tanggal_selesai,
            waktu_mulai, waktu_selesai, jumlah_peserta, tujuan_kegiatan, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'DRAFT')`,
        [
          idUser,
          dto.nama_kegiatan,
          dto.tanggal_mulai,
          dto.tanggal_selesai,
          dto.waktu_mulai,
          dto.waktu_selesai,
          dto.jumlah_peserta,
          dto.tujuan_kegiatan,
        ],
      );
      await this.insertDetails(connection, result.insertId, dto.detail_kebutuhan);
      await connection.commit();
      return result.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async update(id: number, dto: UpdateFskDto): Promise<void> {
    const connection = await this.pool.getConnection();
    try {
      await connection.beginTransaction();
      await connection.execute(
        `UPDATE spesifikasi_kebutuhan SET
           nama_kegiatan = COALESCE(?, nama_kegiatan),
           tanggal_mulai = COALESCE(?, tanggal_mulai),
           tanggal_selesai = COALESCE(?, tanggal_selesai),
           waktu_mulai = COALESCE(?, waktu_mulai),
           waktu_selesai = COALESCE(?, waktu_selesai),
           jumlah_peserta = COALESCE(?, jumlah_peserta),
           tujuan_kegiatan = COALESCE(?, tujuan_kegiatan)
         WHERE id_fsk = ?`,
        [
          dto.nama_kegiatan ?? null,
          dto.tanggal_mulai ?? null,
          dto.tanggal_selesai ?? null,
          dto.waktu_mulai ?? null,
          dto.waktu_selesai ?? null,
          dto.jumlah_peserta ?? null,
          dto.tujuan_kegiatan ?? null,
          id,
        ],
      );
      if (dto.detail_kebutuhan !== undefined) {
        await connection.execute(
          'DELETE FROM detail_kebutuhan_fsk WHERE id_fsk = ?',
          [id],
        );
        await this.insertDetails(connection, id, dto.detail_kebutuhan);
      }
      // Perubahan FSK membatalkan rekomendasi paket sebelumnya.
      await connection.execute(
        'DELETE FROM paket_rekomendasi WHERE id_fsk = ?',
        [id],
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async findById(id: number): Promise<FskRecord | null> {
    const [rows] = await this.pool.execute<RowDataPacket[]>(
      'SELECT * FROM spesifikasi_kebutuhan WHERE id_fsk = ? LIMIT 1',
      [id],
    );
    const row = rows[0];
    if (!row) return null;

    const [detailRows] = await this.pool.execute<RowDataPacket[]>(
      `SELECT * FROM detail_kebutuhan_fsk
       WHERE id_fsk = ? ORDER BY id_detail_kebutuhan ASC`,
      [id],
    );

    return {
      fsk: SpesifikasiKebutuhan.fromRow(row),
      details: detailRows.map((detail) => DetailKebutuhanFsk.fromRow(detail)),
    };
  }

  private async insertDetails(
    connection: PoolConnection,
    idFsk: number,
    details: FskDetailDto[] = [],
  ): Promise<void> {
    for (const input of details) {
      const detail = new DetailKebutuhanFsk(
        0,
        idFsk,
        input.kategori,
        input.jenis_kebutuhan,
        input.jumlah,
        input.keterangan ?? '',
      );
      if (!detail.addDetail()) {
        throw new BusinessException(
          'FSK_INVALID_DETAIL',
          'Jumlah detail kebutuhan harus lebih dari 0',
          HttpStatus.BAD_REQUEST,
        );
      }
      await connection.execute(
        `INSERT INTO detail_kebutuhan_fsk
           (id_fsk, kategori, jenis_kebutuhan, jumlah, keterangan)
         VALUES (?, ?, ?, ?, ?)`,
        [
          detail.id_fsk,
          detail.kategori,
          detail.jenis_kebutuhan,
          detail.jumlah,
          detail.keterangan || null,
        ] satisfies SqlParam[],
      );
    }
  }
}
