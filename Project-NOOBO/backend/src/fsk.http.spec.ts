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

const fskRow = (idFsk: number, idUser: number) => ({
  id_fsk: idFsk,
  id_user: idUser,
  nama_kegiatan: 'Seminar FSK',
  tanggal_mulai: '2099-01-10',
  tanggal_selesai: '2099-01-10',
  waktu_mulai: '08:00',
  waktu_selesai: '17:00',
  jumlah_peserta: 100,
  tujuan_kegiatan: 'Belajar bersama',
  status: 'DRAFT',
  created_at: new Date(),
});

const validBody = {
  nama_kegiatan: 'Seminar FSK',
  tanggal_mulai: '2099-01-10',
  tanggal_selesai: '2099-01-10',
  waktu_mulai: '08:00',
  waktu_selesai: '17:00',
  jumlah_peserta: 100,
  tujuan_kegiatan: 'Belajar bersama',
  detail_kebutuhan: [
    { kategori: 'RUANGAN', jenis_kebutuhan: 'Auditorium', jumlah: 1 },
  ],
};

describe('FSK HTTP layer with mocked pool', () => {
  let app: INestApplication<App>;

  const execute = vi.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('u.email = ?')) {
      const email = params[0];
      if (email === 'mahasiswa@campus.ac.id') {
        return [[userRow(1, String(email), 'PEMINJAM', 1)], []];
      }
      if (email === 'logistik@campus.ac.id') {
        return [[userRow(3, String(email), 'LOGISTIK', 2)], []];
      }
      return [[], []];
    }
    if (sql.includes('u.id_user = ?')) {
      const id = Number(params[0]);
      return [
        [
          userRow(
            id,
            'demo@campus.ac.id',
            id === 3 ? 'LOGISTIK' : 'PEMINJAM',
            id === 3 ? 2 : 1,
          ),
        ],
        [],
      ];
    }
    if (sql.includes('INSERT INTO sessions')) return [{ insertId: 1 }, []];
    if (sql.includes('INSERT INTO spesifikasi_kebutuhan')) {
      return [{ insertId: 500 }, []];
    }
    if (sql.includes('INSERT INTO detail_kebutuhan_fsk')) {
      return [{ insertId: 1 }, []];
    }
    if (sql.includes('DELETE FROM detail_kebutuhan_fsk')) {
      return [{ affectedRows: 1 }, []];
    }
    if (sql.includes('UPDATE spesifikasi_kebutuhan')) {
      return [{ affectedRows: 1 }, []];
    }
    if (sql.includes('FROM spesifikasi_kebutuhan')) {
      const id = Number(params[0]);
      return [[fskRow(id, id === 500 ? 1 : 2)], []];
    }
    if (sql.includes('FROM detail_kebutuhan_fsk')) return [[], []];
    return [[], []];
  });

  const connection = {
    execute,
    query: vi.fn().mockResolvedValue([[], []]),
    ping: vi.fn(),
    beginTransaction: vi.fn(),
    commit: vi.fn(),
    rollback: vi.fn(),
    release: vi.fn(),
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
        end: vi.fn(),
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

  it('allows a PEMINJAM to create a valid FSK', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const res = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody)
      .expect(201);

    expect(res.body.data).toMatchObject({
      id_fsk: 500,
      status: 'DRAFT',
    });
  });

  it('rejects a FSK with zero participants using FSK_INVALID_CAPACITY', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const res = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...validBody, jumlah_peserta: 0 })
      .expect(400);

    expect(res.body.code).toBe('FSK_INVALID_CAPACITY');
  });

  it('rejects FSK creation by a LOGISTIK user', async () => {
    const token = await login('logistik@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send(validBody)
      .expect(403);
  });

  it('rejects an invalid schedule when updating an FSK', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const res = await request(app.getHttpServer())
      .put('/api/v1/fsk/500')
      .set('Authorization', `Bearer ${token}`)
      .send({ tanggal_mulai: '2099-01-12', tanggal_selesai: '2099-01-10' })
      .expect(400);

    expect(res.body.code).toBe('FSK_INVALID_SCHEDULE');
  });

  it('hides an FSK owned by another user behind 404', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    await request(app.getHttpServer())
      .put('/api/v1/fsk/501')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_kegiatan: 'Bukan milik saya' })
      .expect(404);
  });
});
