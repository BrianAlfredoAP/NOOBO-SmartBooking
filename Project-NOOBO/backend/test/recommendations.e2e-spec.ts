import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';

// Catatan: e2e ini memerlukan MySQL berjalan (jalankan `docker compose up -d` di folder Project-NOOBO).
describe('Recommendations (e2e) — memerlukan MySQL', () => {
  let app: INestApplication<App>;

  const fskBody = (namaKegiatan: string, roomNeed = 'Auditorium') => ({
    nama_kegiatan: namaKegiatan,
    tanggal_mulai: '2099-02-10',
    tanggal_selesai: '2099-02-10',
    waktu_mulai: '08:00',
    waktu_selesai: '17:00',
    jumlah_peserta: 100,
    tujuan_kegiatan: 'Belajar bersama',
    detail_kebutuhan: [
      { kategori: 'RUANGAN', jenis_kebutuhan: roomNeed, jumlah: 1 },
      { kategori: 'LOGISTIK', jenis_kebutuhan: 'Proyektor', jumlah: 2 },
    ],
  });

  const login = async (email: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'password123' });
    if (res.status !== 200) throw new Error(`Login gagal untuk ${email}: ${res.status}`);
    return res.body.access_token as string;
  };

  const createFsk = async (token: string, roomNeed?: string) => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/fsk')
      .set('Authorization', `Bearer ${token}`)
      .send(fskBody(`Kegiatan E2E ${Date.now()}`, roomNeed))
      .expect(201);
    return res.body.data.id_fsk as number;
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

  it('menghasilkan paket dengan alasan faktual lalu memilihnya', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const fskId = await createFsk(token);

    const generated = await request(app.getHttpServer())
      .post(`/api/v1/fsk/${fskId}/recommendations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(generated.body.data.length).toBeGreaterThan(0);
    expect(generated.body.data.length).toBeLessThanOrEqual(3);
    expect(generated.body.data[0].alasan).toContain('Kapasitas');
    expect(generated.body.data[0].alasan).toContain('Proyektor');
    expect(generated.body.data[0].ruangan).toBeTruthy();

    const listed = await request(app.getHttpServer())
      .get(`/api/v1/fsk/${fskId}/recommendations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(listed.body.data).toHaveLength(generated.body.data.length);

    const idPaket = generated.body.data[0].id_paket;
    const selected = await request(app.getHttpServer())
      .post(`/api/v1/fsk/${fskId}/select-package`)
      .set('Authorization', `Bearer ${token}`)
      .send({ id_paket: idPaket })
      .expect(201);
    expect(selected.body.data).toMatchObject({ id_paket: idPaket, dipilih: true });
  });

  it('mengembalikan NO_PACKAGE_AVAILABLE bila tipe ruangan tidak tersedia', async () => {
    const token = await login('mahasiswa@campus.ac.id');
    const fskId = await createFsk(token, 'Ruang Tidak Ada');

    const res = await request(app.getHttpServer())
      .post(`/api/v1/fsk/${fskId}/recommendations`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
    expect(res.body.code).toBe('NO_PACKAGE_AVAILABLE');
  });

  it('Logistik tidak bisa menjalankan rekomendasi', async () => {
    const token = await login('logistik@campus.ac.id');
    await request(app.getHttpServer())
      .post('/api/v1/fsk/1/recommendations')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
