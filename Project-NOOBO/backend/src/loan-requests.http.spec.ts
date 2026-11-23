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

describe('Loan request and approval HTTP layer with mocked pool', () => {
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
            id === 3 ? 'logistik@campus.ac.id' : 'mahasiswa@campus.ac.id',
            id === 3 ? 'LOGISTIK' : 'PEMINJAM',
            id === 3 ? 2 : 1,
          ),
        ],
        [],
      ];
    }
    if (sql.includes('INSERT INTO sessions')) return [{ insertId: 1 }, []];
    return [[], []];
  });

  const connection = {
    execute,
    query: vi.fn().mockResolvedValue([[], []]),
    ping: vi.fn().mockResolvedValue(undefined),
    beginTransaction: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
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

  it('blocks LOGISTIK from creating an FPP', async () => {
    const token = await login('logistik@campus.ac.id');

    await request(app.getHttpServer())
      .post('/api/v1/loan-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_fsk: 1, id_pembina: 1, setuju_syarat: true })
      .expect(403);
  });

  it('rejects FPP submission when terms are not accepted', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const res = await request(app.getHttpServer())
      .post('/api/v1/loan-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ id_fsk: 1, id_pembina: 1, setuju_syarat: false })
      .expect(400);

    expect(res.body.code).toBe('TERMS_NOT_ACCEPTED');
  });

  it('returns 404 for an unknown approval token', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/approvals/token-asal')
      .expect(404);
  });

  it('requires a reason when the Pembina rejects', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/approvals/token-asal/decision')
      .send({ decision: 'REJECT' })
      .expect(400);

    expect(res.body.code).toBe('APPROVAL_REASON_REQUIRED');
  });

  it('validates the decision value', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/approvals/token-asal/decision')
      .send({ decision: 'MAYBE', reason: 'coba' })
      .expect(400);

    expect(res.body.code).toBe('VALIDATION_ERROR');
  });
});
