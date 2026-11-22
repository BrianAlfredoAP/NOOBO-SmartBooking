import { describe, it, expect, vi } from 'vitest';
import { UsersRepository } from './users.repository.js';

describe('UsersRepository (mock pool)', () => {
  it('findByEmail uses parameterized query with roles JOIN', async () => {
    const row = {
      id_user: 1,
      role_id: 1,
      role: 'PEMINJAM',
      nama: 'Mahasiswa',
      email: 'm@campus.ac.id',
      password_hash: 'hash',
      status_aktif: 1,
      created_at: new Date(),
    };
    const execute = vi.fn().mockResolvedValue([[row], []]);
    const repository = new UsersRepository({ execute } as never);

    const found = await repository.findByEmail('m@campus.ac.id');

    expect(execute).toHaveBeenCalledWith(
      expect.stringContaining('JOIN roles r ON u.role_id = r.id'),
      ['m@campus.ac.id'],
    );
    expect(found?.role).toBe('PEMINJAM');
  });

  it('createUser inserts hashed password and reads the created row back', async () => {
    const row = {
      id_user: 9,
      role_id: 1,
      role: 'PEMINJAM',
      nama: 'Baru',
      email: 'baru@campus.ac.id',
      password_hash: 'hash',
      status_aktif: 1,
      created_at: new Date(),
    };
    const execute = vi
      .fn()
      .mockResolvedValueOnce([{ insertId: 9 }, []])
      .mockResolvedValueOnce([[row], []]);
    const repository = new UsersRepository({ execute } as never);

    const created = await repository.createUser({
      role_id: 1,
      nama: 'Baru',
      email: 'baru@campus.ac.id',
      password_hash: 'hash',
    });

    expect(execute.mock.calls[0][1]).toEqual([1, 'Baru', 'baru@campus.ac.id', 'hash', true]);
    expect(created.id_user).toBe(9);
  });
});
