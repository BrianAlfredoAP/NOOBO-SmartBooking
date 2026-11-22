var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service.js';
import { SessionsRepository } from './sessions.repository.js';
function hashToken(token) {
    return createHash('sha256').update(token).digest('hex');
}
function durationToSeconds(dur) {
    const d = dur ?? '15m';
    const m = /^(\d+)([smhd])$/.exec(d);
    const n = m ? Number(m[1]) : 15;
    const unit = m?.[2] ?? 'm';
    const mult = { s: 1, m: 60, h: 3_600, d: 86_400 };
    return n * (mult[unit] ?? 60);
}
let AuthService = class AuthService {
    usersService;
    jwtService;
    config;
    sessions;
    constructor(usersService, jwtService, config, sessions) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
        this.sessions = sessions;
    }
    async login(email, pass) {
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
        const payload = {
            sub: user.id_user,
            email: user.email,
            role: user.role,
        };
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: durationToSeconds(this.config.get('JWT_EXPIRES_IN')),
        });
        const refresh_token = await this.jwtService.signAsync(payload, {
            secret: this.config.get('JWT_REFRESH_SECRET'),
            expiresIn: durationToSeconds(this.config.get('JWT_REFRESH_EXPIRES_IN')),
        });
        await this.sessions.create(user.id_user, hashToken(refresh_token), new Date(Date.now() +
            durationToSeconds(this.config.get('JWT_REFRESH_EXPIRES_IN')) * 1000));
        return {
            message: 'Login berhasil',
            access_token,
            refresh_token,
            user: { id: user.id_user, email: user.email, role: user.role },
        };
    }
    async refresh(refreshToken) {
        let payload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
            });
        }
        catch {
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
        const access_token = await this.jwtService.signAsync({ sub: user.id_user, email: user.email, role: user.role }, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: durationToSeconds(this.config.get('JWT_EXPIRES_IN')),
        });
        return { access_token };
    }
    async validateToken(accessToken) {
        try {
            return await this.jwtService.verifyAsync(accessToken, {
                secret: this.config.get('JWT_SECRET'),
            });
        }
        catch {
            throw new UnauthorizedException('Token tidak valid');
        }
    }
    async logout(refreshToken) {
        await this.sessions.invalidateByTokenHash(hashToken(refreshToken));
    }
    async getProfile(userId) {
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
};
AuthService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [UsersService,
        JwtService,
        ConfigService,
        SessionsRepository])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map