import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

describe('AuthService', () => {
  let authService: AuthService;
  const passwordHash = bcrypt.hashSync('password123', 10);

  const usersService = {
    findByEmail: vi.fn(),
    findById: vi.fn(),
  };
  const jwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };
  const config = {
    get: vi.fn((key: string) => {
      const map: Record<string, string> = {
        JWT_SECRET: 'secret',
        JWT_REFRESH_SECRET: 'refresh-secret',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
      };
      return map[key];
    }),
  };
  const sessions = {
    create: vi.fn(),
    findActiveByTokenHash: vi.fn(),
    invalidateByTokenHash: vi.fn(),
  };

  const activeUser = {
    id_user: 1,
    role_id: 1,
    role: 'PEMINJAM',
    nama: 'Mahasiswa',
    email: 'mahasiswa@campus.ac.id',
    password_hash: passwordHash,
    status_aktif: true,
    created_at: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    jwtService.signAsync.mockResolvedValue('mock-token');
    sessions.create.mockResolvedValue(undefined);
    sessions.findActiveByTokenHash.mockResolvedValue(true);
    sessions.invalidateByTokenHash.mockResolvedValue(undefined);
    authService = new AuthService(
      usersService as never,
      jwtService as never,
      config as never,
      sessions as never,
    );
  });

  it('should login active user with correct password and return tokens', async () => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    const result = await authService.login('mahasiswa@campus.ac.id', 'password123');

    expect(result.message).toBe('Login berhasil');
    expect(result.access_token).toBe('mock-token');
    expect(result.refresh_token).toBe('mock-token');
    expect(result.user).toEqual({
      id: 1,
      email: 'mahasiswa@campus.ac.id',
      role: 'PEMINJAM',
    });
    expect(sessions.create).toHaveBeenCalledOnce();
  });

  it('should throw UnauthorizedException when email is not registered', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(
      authService.login('unknown@campus.ac.id', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw ForbiddenException when account is inactive', async () => {
    usersService.findByEmail.mockResolvedValue({ ...activeUser, status_aktif: false });
    await expect(
      authService.login('inactive@campus.ac.id', 'password123'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException when password is incorrect', async () => {
    usersService.findByEmail.mockResolvedValue(activeUser);
    await expect(
      authService.login('mahasiswa@campus.ac.id', 'wrongpassword'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should refresh access token for a valid active refresh token', async () => {
    const payload: JwtPayload = {
      sub: 1,
      email: 'mahasiswa@campus.ac.id',
      role: 'PEMINJAM',
    };
    jwtService.verifyAsync.mockResolvedValue(payload);
    usersService.findById.mockResolvedValue(activeUser);

    const result = await authService.refresh('valid-refresh');
    expect(result.access_token).toBe('mock-token');
  });

  it('should throw UnauthorizedException when refresh token has been revoked', async () => {
    jwtService.verifyAsync.mockResolvedValue({
      sub: 1,
      email: 'x',
      role: 'PEMINJAM',
    });
    sessions.findActiveByTokenHash.mockResolvedValue(false);
    await expect(authService.refresh('revoked')).rejects.toThrow(UnauthorizedException);
  });

  it('should validate an access token payload', async () => {
    const payload: JwtPayload = { sub: 1, email: 'm@campus.ac.id', role: 'PEMINJAM' };
    jwtService.verifyAsync.mockResolvedValue(payload);

    await expect(authService.validateToken('access-token')).resolves.toEqual(payload);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('access-token', { secret: 'secret' });
  });

  it('should reject an invalid access token', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad signature'));
    await expect(authService.validateToken('bad-token')).rejects.toThrow(UnauthorizedException);
  });

  it('should return profile for an existing user', async () => {
    usersService.findById.mockResolvedValue(activeUser);
    const profile = await authService.getProfile(1);
    expect(profile).toEqual({
      id: 1,
      nama: 'Mahasiswa',
      email: 'mahasiswa@campus.ac.id',
      role: 'PEMINJAM',
      status_aktif: true,
    });
  });
});
