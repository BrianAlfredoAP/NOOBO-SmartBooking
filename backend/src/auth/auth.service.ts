import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { SessionsRepository } from './sessions.repository.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function durationToSeconds(dur: string | undefined): number {
  const d = dur ?? '15m';
  const m = /^(\d+)([smhd])$/.exec(d);
  const n = m ? Number(m[1]) : 15;
  const unit = m?.[2] ?? 'm';
  const mult: Record<string, number> = { s: 1, m: 60, h: 3_600, d: 86_400 };
  return n * (mult[unit] ?? 60);
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessions: SessionsRepository,
  ) {}

  async login(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Email tidak terdaftar');
    }
    if (!user.status_aktif) {
      throw new ForbiddenException('Akun tidak aktif');
    }
    const isMatch = await bcrypt.compare(pass, user.password_hash);
    if (!isMatch) {
      throw new UnauthorizedException('Password salah');
    }

    const payload: JwtPayload = {
      sub: user.id_user,
      email: user.email,
      role: user.role,
    };
    const access_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_SECRET'),
      expiresIn: durationToSeconds(this.config.get<string>('JWT_EXPIRES_IN')),
    });
    const refresh_token = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: durationToSeconds(this.config.get<string>('JWT_REFRESH_EXPIRES_IN')),
    });

    await this.sessions.create(
      user.id_user,
      hashToken(refresh_token),
      new Date(
        Date.now() +
          durationToSeconds(this.config.get<string>('JWT_REFRESH_EXPIRES_IN')) * 1000,
      ),
    );

    return {
      message: 'Login berhasil',
      access_token,
      refresh_token,
      user: { id: user.id_user, email: user.email, role: user.role },
    };
  }

  async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token tidak valid');
    }

    const active = await this.sessions.findActiveByTokenHash(hashToken(refreshToken));
    if (!active) {
      throw new UnauthorizedException('Refresh token telah dicabut');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.status_aktif) {
      throw new UnauthorizedException('Sesi tidak valid');
    }

    const access_token = await this.jwtService.signAsync(
      { sub: user.id_user, email: user.email, role: user.role },
      {
        secret: this.config.get<string>('JWT_SECRET'),
        expiresIn: durationToSeconds(this.config.get<string>('JWT_EXPIRES_IN')),
      },
    );
    return { access_token };
  }

  async validateToken(accessToken: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(accessToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Token tidak valid');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.sessions.invalidateByTokenHash(hashToken(refreshToken));
  }

  async getProfile(userId: number) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Sesi tidak valid');
    }
    return {
      id: user.id_user,
      nama: user.nama,
      email: user.email,
      role: user.role,
      status_aktif: user.status_aktif,
    };
  }
}
