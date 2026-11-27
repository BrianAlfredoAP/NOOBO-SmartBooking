import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { MYSQL_POOL } from './database/database.constants.js';

const passwordHash = bcrypt.hashSync('password123', 10);

const userRow = (idUser: number, email: string, role: string, roleId: number) => ({
  id_user: idUser,
  role_id: roleId,
  role,
  nama: 'Demo',
  email,
  password_hash: passwordHash,
  status_aktif: 1,
  created_at: new Date(),
});

/**
 * Sprint 5 HTTP surface. Pool is mocked: this verifies routing, guards and
 * request validation without needing MySQL.
 */
describe('Sprint 5 logistics & SBP routes with mocked pool', () => {
  let app: INestApplication<App>;

  const execute = vi.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('u.email = ?')) {
      const email = String(params[0]);
      if (email === 'mahasiswa@campus.ac.id') {
        return [[userRow(1, email, 'PEMINJAM', 1)], []];
      }
      if (email === 'logistik@campus.ac.id') {
        return [[userRow(3, email, 'LOGISTIK', 2)], []];
      }
      return [[], []];
    }
    if (sql.includes('u.id_user = ?')) {
      const id = Number(params[0]);
      return [
        [
          userRow(
            id,
            id === 3 ? 'logistik@campus.ac.id' : 'mahasiswa@campus.ac.id',
            id === 3 ? 'LOGISTIK' : 'PEMINJAM',
            id === 3 ? 2 : 1,
          ),
        ],
        [],
      ];
    }
    if (sql.includes('INSERT INTO sessions')) return [{ insertId: 1 }, []];
    if (sql.includes('COUNT(*) AS total')) return [[{ total: 0 }], []];
    return [[], []];
  });

  const connection = {
    execute,
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
    release: vi.fn(),
    ping: vi.fn().mockResolvedValue(undefined),
    query: vi.fn().mockResolvedValue([[], []]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MYSQL_POOL)
      .useValue({
        execute,
        query: vi.fn().mockResolvedValue([[], []]),
        getConnection: vi.fn().mockResolvedValue(connection),
        end: vi.fn().mockResolvedValue(undefined),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const login = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    expect(res.status).toBe(200);
    return res.body.access_token as string;
  };

  it('blocks PEMINJAM from the Logistics queue', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    await request(app.getHttpServer())
      .get('/api/v1/logistics/loan-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('serves the Logistics queue and ongoing loans to LOGISTIK', async () => {
    const token = await login('logistik@campus.ac.id');

    const queue = await request(app.getHttpServer())
      .get('/api/v1/logistics/loan-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(queue.body.message).toBe('Antrean pengajuan Logistik');
    expect(queue.body.meta).toMatchObject({ page: 1, limit: 10 });

    const ongoing = await request(app.getHttpServer())
      .get('/api/v1/logistics/ongoing-loans')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(ongoing.body.data).toEqual([]);
  });

  it('validates the Logistics decision payload', async () => {
    const token = await login('logistik@campus.ac.id');

    const res = await request(app.getHttpServer())
      .post('/api/v1/logistics/loan-requests/7/decision')
      .set('Authorization', `Bearer ${token}`)
      .send({ keputusan: 'MAYBE' })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');

    const missingReason = await request(app.getHttpServer())
      .post('/api/v1/logistics/loan-requests/7/decision')
      .set('Authorization', `Bearer ${token}`)
      .send({ keputusan: 'REJECT' })
      .expect(400);
    expect(missingReason.body.code).toBe('LOGISTICS_REASON_REQUIRED');
  });

  it('returns 404 DOCUMENT_NOT_AVAILABLE when no SBP exists yet', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const res = await request(app.getHttpServer())
      .get('/api/v1/me/loan-requests/7/sbp')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body.code).toBe('DOCUMENT_NOT_AVAILABLE');
  });

  it('hides another user request behind 404 on the dashboard', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    await request(app.getHttpServer())
      .get('/api/v1/me/loan-requests/7')
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('lists only the Peminjam own requests', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const res = await request(app.getHttpServer())
      .get('/api/v1/me/loan-requests')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.message).toBe('Daftar pengajuan saya');
    expect(res.body.data).toEqual([]);
  });

  it('validates SBPG submission payload on POST /api/v1/me/loan-requests/:id/sbpg', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const invalid = await request(app.getHttpServer())
      .post('/api/v1/me/loan-requests/7/sbpg')
      .set('Authorization', `Bearer ${token}`)
      .send({ items: [] })
      .expect(400);
    expect(invalid.body.code).toBe('VALIDATION_ERROR');

    const logistikToken = await login('logistik@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/me/loan-requests/7/sbpg')
      .set('Authorization', `Bearer ${logistikToken}`)
      .send({
        items: [
          {
            id_alokasi_logistik: 1,
            jumlah_dikembalikan: 1,
            kondisi_kembali: 'Baik',
          },
        ],
      })
      .expect(403);
  });

  it('serves and protects Logistics return & inspection routes', async () => {
    const peminjamToken = await login('mahasiswa@campus.ac.id');
    await request(app.getHttpServer())
      .get('/api/v1/logistics/returns')
      .set('Authorization', `Bearer ${peminjamToken}`)
      .expect(403);

    const logistikToken = await login('logistik@campus.ac.id');
    const queue = await request(app.getHttpServer())
      .get('/api/v1/logistics/returns?status=PENDING_INSPECTION')
      .set('Authorization', `Bearer ${logistikToken}`)
      .expect(200);
    expect(queue.body.message).toBe('Daftar pengembalian');
    expect(queue.body.data).toEqual([]);

    const badFinding = await request(app.getHttpServer())
      .post('/api/v1/logistics/returns/7/inspection')
      .set('Authorization', `Bearer ${logistikToken}`)
      .send({
        temuan: [
          {
            jenis_temuan: 'UNKNOWN_TYPE',
            jumlah: 1,
            deskripsi: 'coba',
          },
        ],
      })
      .expect(400);
    expect(badFinding.body.code).toBe('VALIDATION_ERROR');
  });

  it('serves GET /api/v1/history for PEMINJAM and LOGISTIK and hides unowned details behind 404', async () => {
    const peminjamToken = await login('mahasiswa@campus.ac.id');
    const peminjamHistory = await request(app.getHttpServer())
      .get('/api/v1/history?status=COMPLETED&from=2026-11-01&to=2026-11-30')
      .set('Authorization', `Bearer ${peminjamToken}`)
      .expect(200);
    expect(peminjamHistory.body.message).toBe('Riwayat peminjaman');
    expect(peminjamHistory.body.data).toEqual([]);

    await request(app.getHttpServer())
      .get('/api/v1/history/7')
      .set('Authorization', `Bearer ${peminjamToken}`)
      .expect(404);

    const logistikToken = await login('logistik@campus.ac.id');
    const logistikHistory = await request(app.getHttpServer())
      .get('/api/v1/history?q=Seminar')
      .set('Authorization', `Bearer ${logistikToken}`)
      .expect(200);
    expect(logistikHistory.body.message).toBe('Riwayat peminjaman');
  });
});
