import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RefreshTokenDto } from './dto/refresh-token.dto.js';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        message: string;
        access_token: string;
        refresh_token: string;
        user: {
            id: number;
            email: string;
            role: string;
        };
    }>;
    refresh(dto: RefreshTokenDto): Promise<{
        access_token: string;
    }>;
    me(user: {
        id: number;
    }): Promise<{
        id: number;
        nama: string;
        email: string;
        role: string;
        status_aktif: boolean;
    }>;
    logout(dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
}
