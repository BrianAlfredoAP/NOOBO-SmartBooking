import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';

// Catatan: e2e ini memerlukan MySQL berjalan (jalankan `docker compose up -d` di root repo).
describe('Authentication (e2e) — memerlukan MySQL', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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

  describe('POST /api/v1/auth/login', () => {
    it('Positive: valid credentials -> 200 + access_token + refresh_token + user PEMINJAM', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'mahasiswa@campus.ac.id', password: 'password123' })
        .expect(200);

      expect(res.body.access_token).toBeDefined();
      expect(res.body.refresh_token).toBeDefined();
      expect(res.body.user).toEqual({
        id: 1,
        email: 'mahasiswa@campus.ac.id',
        role: 'PEMINJAM',
      });
      expect(res.body.user).not.toHaveProperty('password_hash');
    });

    it('Negative 1: unregistered email -> 401 Email tidak terdaftar', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'notfound@campus.ac.id', password: 'password123' })
        .expect(401);
      expect(res.body.message).toBe('Email tidak terdaftar');
    });

    it('Negative 2: wrong password -> 401 Password salah', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'mahasiswa@campus.ac.id', password: 'wrongpassword' })
        .expect(401);
      expect(res.body.message).toBe('Password salah');
    });

    it('Negative 3: inactive account -> 403 Akun tidak aktif', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'inactive@campus.ac.id', password: 'password123' })
        .expect(403);
      expect(res.body.message).toBe('Akun tidak aktif');
    });

    it('Negative 4: invalid email format -> 400 errors contain Format email tidak valid', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'bukan-email-valid', password: 'password123' })
        .expect(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining(['Format email tidak valid']),
      );
    });

    it('Negative 5: empty email -> 400 errors contain Email tidak boleh kosong', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: '', password: 'password123' })
        .expect(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining(['Email tidak boleh kosong']),
      );
    });

    it('Negative 6: password < 6 chars -> 400 errors contain Password minimal 6 karakter', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'mahasiswa@campus.ac.id', password: '123' })
        .expect(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining(['Password minimal 6 karakter']),
      );
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return profile with valid Bearer token', async () => {
      const login = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'mahasiswa@campus.ac.id', password: 'password123' });

      const res = await request(app.getHttpServer())
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${login.body.access_token}`)
        .expect(200);

      expect(res.body.email).toBe('mahasiswa@campus.ac.id');
      expect(res.body.role).toBe('PEMINJAM');
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
    });
  });
});
