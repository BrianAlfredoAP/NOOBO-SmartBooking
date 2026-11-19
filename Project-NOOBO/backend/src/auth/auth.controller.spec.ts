import { describe, it, expect, beforeEach } from 'vitest';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
    authService = new AuthService(usersService);
    authController = new AuthController(authService);
  });

  it('should successfully login with valid credentials', async () => {
    const response = await authController.login({
      email: 'mahasiswa@campus.ac.id',
      password: 'password123',
    });

    expect(response).toEqual({
      message: 'Login berhasil',
      user: {
        id: 1,
        email: 'mahasiswa@campus.ac.id',
        role: 'Peminjam',
      },
    });
  });
});
