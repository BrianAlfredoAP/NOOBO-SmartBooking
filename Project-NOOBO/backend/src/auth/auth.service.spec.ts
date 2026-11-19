import { describe, it, expect, beforeEach } from 'vitest';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;

  beforeEach(() => {
    usersService = new UsersService();
    authService = new AuthService(usersService);
  });

  it('should validate active user with correct password and exclude password_hash', async () => {
    const result = await authService.validateUser('mahasiswa@campus.ac.id', 'password123');
    expect(result).toBeDefined();
    expect(result.id_user).toBe(1);
    expect(result.email).toBe('mahasiswa@campus.ac.id');
    expect(result.role).toBe('Peminjam');
    expect(result.password_hash).toBeUndefined();
  });

  it('should throw UnauthorizedException when email is not registered', async () => {
    await expect(
      authService.validateUser('unknown@campus.ac.id', 'password123'),
    ).rejects.toThrow(UnauthorizedException);

    try {
      await authService.validateUser('unknown@campus.ac.id', 'password123');
    } catch (err: any) {
      expect(err.message).toBe('Email tidak terdaftar');
    }
  });

  it('should throw ForbiddenException when user account is inactive', async () => {
    await expect(
      authService.validateUser('inactive@campus.ac.id', 'password123'),
    ).rejects.toThrow(ForbiddenException);

    try {
      await authService.validateUser('inactive@campus.ac.id', 'password123');
    } catch (err: any) {
      expect(err.message).toBe('Akun tidak aktif');
    }
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    await expect(
      authService.validateUser('mahasiswa@campus.ac.id', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);

    try {
      await authService.validateUser('mahasiswa@campus.ac.id', 'wrongpassword');
    } catch (err: any) {
      expect(err.message).toBe('Password salah');
    }
  });
});
