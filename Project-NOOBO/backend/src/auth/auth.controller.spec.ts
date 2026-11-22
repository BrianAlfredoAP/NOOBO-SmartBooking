import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from './auth.controller.js';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    getProfile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    controller = new AuthController(authService as never);
  });

  it('should delegate login to AuthService and return its result', async () => {
    authService.login.mockResolvedValue({
      message: 'Login berhasil',
      access_token: 'a',
      refresh_token: 'r',
      user: { id: 1, email: 'm@x', role: 'PEMINJAM' },
    });
    const result = await controller.login({ email: 'm@x', password: 'password123' });

    expect(authService.login).toHaveBeenCalledWith('m@x', 'password123');
    expect(result.access_token).toBe('a');
    expect(result.user.role).toBe('PEMINJAM');
  });

  it('should delegate refresh to AuthService', async () => {
    authService.refresh.mockResolvedValue({ access_token: 'new-token' });
    const result = await controller.refresh({ refresh_token: 'r' });

    expect(authService.refresh).toHaveBeenCalledWith('r');
    expect(result.access_token).toBe('new-token');
  });
});
