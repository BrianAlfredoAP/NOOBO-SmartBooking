import { describe, it, expect, vi } from 'vitest';
import { Ruangan } from './entities/logistics/ruangan.entity.js';
import { Logistik } from './entities/logistics/logistik.entity.js';
import { Pembina } from './entities/workflow/pembina.entity.js';
import { RoomsService } from './rooms/rooms.service.js';
import { LogisticItemsService } from './logistic-items/logistic-items.service.js';
import { PembinaService } from './pembina/pembina.service.js';
import { LoanRulesService } from './loan-rules/loan-rules.service.js';

const roomRow = {
  id_ruangan: 1,
  nama_ruangan: 'Ruang A',
  jenis: 'Ruang Seminar',
  lokasi: 'Gedung B',
  kapasitas: 80,
  kondisi_fasilitas: 'Baik',
  status_aktif: 1,
};
const logisticRow = {
  id_logistik: 1,
  nama_logistik: 'Proyektor',
  jenis: 'Elektronik',
  stok_total: 10,
  kondisi_fasilitas: 'Baik',
  status_aktif: 1,
};

async function expectBusinessCode(
  promise: Promise<unknown>,
  code: string,
): Promise<void> {
  try {
    await promise;
    throw new Error('Expected BusinessException');
  } catch (error) {
    expect(error).toMatchObject({ code });
  }
}

describe('Master data services', () => {
  it('rejects duplicate room name and deletion while actively allocated', async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(Ruangan.fromRow({ ...roomRow, status_aktif: 1 })),
      findByName: vi.fn().mockResolvedValue(true),
      hasActiveAllocation: vi.fn().mockResolvedValue(true),
    };
    const service = new RoomsService(repo as never);

    await expectBusinessCode(
      service.create({
        nama_ruangan: 'Ruang A',
        jenis: 'Ruang Seminar',
        lokasi: 'Gedung B',
        kapasitas: 80,
      }),
      'ROOM_NAME_TAKEN',
    );
    await expectBusinessCode(service.remove(1), 'ROOM_IN_USE');
    expect(repo.findByName).toHaveBeenCalledWith('Ruang A');
  });

  it('rejects a stock update that would make stock negative', async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(Logistik.fromRow({ ...logisticRow, stok_total: 10 })),
      findByName: vi.fn().mockResolvedValue(false),
      update: vi.fn(),
    };
    const service = new LogisticItemsService(repo as never);

    await expectBusinessCode(service.update(1, { stok_total: -1 }), 'LOGISTIC_STOCK_INVALID');
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects deleting a pembina with an active request', async () => {
    const repo = {
      findById: vi.fn().mockResolvedValue(
        Pembina.fromRow({
          id_pembina: 1,
          nama_pembina: 'Dr. Budi',
          email_pembina: 'budi@campus.ac.id',
          status_aktif: 1,
        }),
      ),
      hasActiveRequest: vi.fn().mockResolvedValue(true),
    };
    const service = new PembinaService(repo as never);

    await expectBusinessCode(service.remove(1), 'PEMBINA_IN_USE');
  });

  it('rejects duplicate loan rule name', async () => {
    const repo = {
      findByName: vi.fn().mockResolvedValue(true),
    };
    const service = new LoanRulesService(repo as never);

    await expectBusinessCode(
      service.create({ nama_aturan: 'Aturan Umum', ketentuan: 'Wajib lapor' }),
      'LOAN_RULE_NAME_TAKEN',
    );
  });
});
