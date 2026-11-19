import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login - Master Plan Phase 1 Verification Matrix', () => {
    it('Positive Case: Valid credentials -> 200 OK & safe user payload without password_hash', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mahasiswa@campus.ac.id',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toEqual({
        message: 'Login berhasil',
        user: {
          id: 1,
          email: 'mahasiswa@campus.ac.id',
          role: 'Peminjam',
        },
      });
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('Negative Case 1: Unregistered email -> 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'notfound@campus.ac.id',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('Email tidak terdaftar');
    });

    it('Negative Case 2: Incorrect password -> 401 Unauthorized', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mahasiswa@campus.ac.id',
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Password salah');
    });

    it('Negative Case 3: Inactive account -> 403 Forbidden', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'inactive@campus.ac.id',
          password: 'password123',
        })
        .expect(403);

      expect(response.body.message).toBe('Akun tidak aktif');
    });

    it('Negative Case 4: Invalid email format -> 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'bukan-email-valid',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toContain('Format email tidak valid');
    });

    it('Negative Case 5: Empty email -> 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: '',
          password: 'password123',
        })
        .expect(400);

      expect(response.body.message).toContain('Email tidak boleh kosong');
    });

    it('Negative Case 6: Password less than 6 characters -> 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'mahasiswa@campus.ac.id',
          password: '123',
        })
        .expect(400);

      expect(response.body.message).toContain('Password minimal 6 karakter');
    });
  });
});
