import { describe, expect, it, vi } from 'vitest';
import type { Pool, PoolConnection } from 'mysql2/promise';
import { DatabaseConnectionService } from './database.service.js';

function createPoolMock() {
  const ping = vi.fn().mockResolvedValue(undefined);
  const release = vi.fn();
  const getConnection = vi
    .fn()
    .mockResolvedValue({ ping, release } as unknown as PoolConnection);
  const end = vi.fn().mockResolvedValue(undefined);
  const pool = { getConnection, end } as unknown as Pool;
  return { ping, release, getConnection, end, pool };
}

describe('DatabaseConnectionService', () => {
  it('checks a connection and releases it back to the pool', async () => {
    const { ping, release, getConnection, pool } = createPoolMock();
    const service = new DatabaseConnectionService(pool);

    await service.onModuleInit();

    expect(getConnection).toHaveBeenCalledOnce();
    expect(ping).toHaveBeenCalledOnce();
    expect(release).toHaveBeenCalledOnce();
  });

  it('closes the pool during application shutdown', async () => {
    const { end, pool } = createPoolMock();
    const service = new DatabaseConnectionService(pool);

    await service.onApplicationShutdown();

    expect(end).toHaveBeenCalledOnce();
  });

  it('reports a clear error if the connection check fails', async () => {
    const { ping, release, end, pool } = createPoolMock();
    ping.mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const service = new DatabaseConnectionService(pool);

    await expect(service.onModuleInit()).rejects.toThrow(
      'MySQL connection failed. Check that MySQL is running',
    );
    expect(release).toHaveBeenCalledOnce();
    expect(end).toHaveBeenCalledOnce();
  });
});
