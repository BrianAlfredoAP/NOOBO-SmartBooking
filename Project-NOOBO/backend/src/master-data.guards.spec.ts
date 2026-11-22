import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import * as bcrypt from 'bcrypt';
import { AppModule } from './app.module.js';
import { MYSQL_POOL } from './database/database.constants.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

const passwordHash = bcrypt.hashSync('password123', 10);
const userRow = (id_user: number, email: string, role: string, role_id: number) => ({
  id_user,
  role_id,
  role,
  nama: 'Demo',
  email,
  password_hash: passwordHash,
  status_aktif: 1,
  created_at: new Date(),
});

const roomRow = {
  id_ruangan: 99,
  nama_ruangan: 'Room Guard Test',
  jenis: 'Ruang Seminar',
  lokasi: 'Gedung B',
  kapasitas: 20,
  kondisi_fasilitas: 'Baik',
  status_aktif: 1,
};

describe('Master data HTTP layer with mocked pool', () => {
  let app: INestApplication<App>;

  const execute = vi.fn(async (sql: string, params: unknown[] = []) => {
    if (sql.includes('u.email = ?')) {
      const email = params[0];
      if (email === 'mahasiswa@campus.ac.id') return [[userRow(1, String(email), 'PEMINJAM', 1)], []];
      if (email === 'logistik@campus.ac.id') return [[userRow(3, String(email), 'LOGISTIK', 2)], []];
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
    if (sql.includes('INSERT INTO ruangan')) return [{ insertId: 99 }, []];
    if (sql.includes('SELECT 1 FROM ruangan')) return [[], []];
    if (sql.includes('FROM ruangan')) return [[roomRow], []];
    return [[], []];
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(MYSQL_POOL)
      .useValue({
        execute,
        query: vi.fn().mockResolvedValue([[], []]),
        getConnection: vi
          .fn()
          .mockResolvedValue({ ping: vi.fn(), release: vi.fn() }),
        end: vi.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
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

  it('GET /rooms is allowed for PEMINJAM', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const res = await request(app.getHttpServer())
      .get('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body.data[0].nama_ruangan).toBe('Room Guard Test');
  });

  it('POST /rooms is rejected for PEMINJAM with 403', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_ruangan: 'Room', jenis: 'Ruang Seminar', lokasi: 'B', kapasitas: 20 })
      .expect(403);
  });

  it('POST /rooms is allowed for LOGISTIK', async () => {
    const token = await login('logistik@campus.ac.id');
    const res = await request(app.getHttpServer())
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_ruangan: 'Room Guard Test', jenis: 'Ruang Seminar', lokasi: 'B', kapasitas: 20 })
      .expect(201);
    expect(res.body.data.id_ruangan).toBe(99);
  });
});
