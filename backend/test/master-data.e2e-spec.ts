import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';

// Catatan: e2e ini memerlukan MySQL berjalan (jalankan `docker compose up -d` di root repo).
describe('Master data & role guard (e2e) — memerlukan MySQL', () => {
  let app: INestApplication<App>;

  const login = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    if (res.status !== 200) throw new Error(`Login gagal untuk ${email}: ${res.status}`);
    return res.body.access_token as string;
  };

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

  it('Peminjam bisa GET rooms tetapi tidak bisa POST', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    await request(app.getHttpServer())
      .get('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_ruangan: 'Room E2E', jenis: 'Ruang Seminar', lokasi: 'B', kapasitas: 20 })
      .expect(403);
  });

  it('Logistik bisa CRUD dan soft-delete ruangan', async () => {
    const token = await login('logistik@campus.ac.id');
    const nama = `Room E2E ${Date.now()}`;

    const created = await request(app.getHttpServer())
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_ruangan: nama, jenis: 'Ruang Seminar', lokasi: 'Gedung B', kapasitas: 20 })
      .expect(201);
    expect(created.body.data.nama_ruangan).toBe(nama);
    expect(created.body.data.status_aktif).toBe(true);

    const id = created.body.data.id_ruangan;
    await request(app.getHttpServer())
      .patch(`/api/v1/rooms/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ kapasitas: 25 })
      .expect(200)
      .expect((res) => expect(res.body.data.kapasitas).toBe(25));

    await request(app.getHttpServer())
      .delete(`/api/v1/rooms/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const list = await request(app.getHttpServer())
      .get(`/api/v1/rooms?q=${encodeURIComponent(nama)}&status_aktif=false`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].status_aktif).toBe(false);
    expect(list.body.meta).toMatchObject({ page: 1, limit: 10, total: 1 });
  });

  it('Validasi kapasitas ditolak dengan kode VALIDATION_ERROR', async () => {
    const token = await login('logistik@campus.ac.id');
    const res = await request(app.getHttpServer())
      .post('/api/v1/rooms')
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_ruangan: 'Invalid', jenis: 'Ruang Seminar', lokasi: 'B', kapasitas: 0 })
      .expect(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('Logistik bisa CRUD logistik, Peminjam hanya GET', async () => {
    const peminjam = await login('mahasiswa@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/logistic-items')
      .set('Authorization', `Bearer ${peminjam}`)
      .send({ nama_logistik: 'Item', jenis: 'Elektronik', stok_total: 1 })
      .expect(403);

    const logistik = await login('logistik@campus.ac.id');
    const nama = `Item E2E ${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/api/v1/logistic-items')
      .set('Authorization', `Bearer ${logistik}`)
      .send({ nama_logistik: nama, jenis: 'Elektronik', stok_total: 5 })
      .expect(201);
    expect(created.body.data.stok_total).toBe(5);
  });
});
