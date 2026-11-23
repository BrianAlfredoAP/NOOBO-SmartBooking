import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';

// Catatan: e2e ini memerlukan MySQL berjalan (jalankan `docker compose up -d` di folder Project-NOOBO).
describe('FSK (e2e) — memerlukan MySQL', () => {
  let app: INestApplication<App>;

  const body = {
    nama_kegiatan: `Seminar E2E ${Date.now()}`,
    tanggal_mulai: '2099-01-10',
    tanggal_selesai: '2099-01-10',
    waktu_mulai: '08:00',
    waktu_selesai: '17:00',
    jumlah_peserta: 100,
    tujuan_kegiatan: 'Belajar bersama',
    detail_kebutuhan: [
      { kategori: 'RUANGAN', jenis_kebutuhan: 'Auditorium', jumlah: 1 },
      { kategori: 'LOGISTIK', jenis_kebutuhan: 'Proyektor', jumlah: 2 },
    ],
  };

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

  it('Peminjam bisa menyimpan dan mengubah FSK valid', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const created = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send(body)
      .expect(201);

    expect(created.body.data.status).toBe('DRAFT');
    expect(created.body.data.detail_kebutuhan).toHaveLength(2);

    const id = created.body.data.id_fsk;
    const updated = await request(app.getHttpServer())
      .put(`/api/v1/fsk/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nama_kegiatan: `${body.nama_kegiatan} Revisi`, jumlah_peserta: 120 })
      .expect(200);

    expect(updated.body.data.nama_kegiatan).toBe(`${body.nama_kegiatan} Revisi`);
    expect(updated.body.data.jumlah_peserta).toBe(120);
    expect(updated.body.data.detail_kebutuhan).toHaveLength(2);
  });

  it('FSK tidak valid memakai kode error FSK_INVALID_*', async () => {
    const token = await login('mahasiswa@campus.ac.id');

    const capacity = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, jumlah_peserta: 0 })
      .expect(400);
    expect(capacity.body.code).toBe('FSK_INVALID_CAPACITY');

    const schedule = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...body, tanggal_mulai: '2020-01-10', tanggal_selesai: '2020-01-11' })
      .expect(400);
    expect(schedule.body.code).toBe('FSK_INVALID_SCHEDULE');

    const detail = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send({
        ...body,
        detail_kebutuhan: [
          { kategori: 'LOGISTIK', jenis_kebutuhan: 'Proyektor', jumlah: 0 },
        ],
      })
      .expect(400);
    expect(detail.body.code).toBe('FSK_INVALID_DETAIL');
  });

  it('Logistik tidak bisa membuat FSK dan FSK user lain tidak ditemukan', async () => {
    const logistik = await login('logistik@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${logistik}`)
      .send(body)
      .expect(403);

    const peminjam = await login('mahasiswa@campus.ac.id');
    await request(app.getHttpServer())
      .put('/api/v1/fsk/999999')
      .set('Authorization', `Bearer ${peminjam}`)
      .send({ nama_kegiatan: 'Tidak ada' })
      .expect(404);
  });
});
