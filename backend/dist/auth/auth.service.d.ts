import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service.js';
import { SessionsRepository } from './sessions.repository.js';
import type { JwtPayload } from './strategies/jwt.strategy.js';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly config;
    private readonly sessions;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService, sessions: SessionsRepository);
    login(email: string, pass: string): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            email: string;
            role: string;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        access_token: string;
    }>;
    validateToken(accessToken: string): Promise<JwtPayload>;
    logout(refreshToken: string): Promise<void>;
    getProfile(userId: number): Promise<{
        id: number;
        nama: string;
        email: string;
        role: string;
        status_aktif: boolean;
    }>;
}
