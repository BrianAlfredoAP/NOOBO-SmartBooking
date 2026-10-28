import { UsersService } from '../users/users.service.js';
export declare class AuthService {
    private usersService;
    constructor(usersService: UsersService);
    validateUser(email: string, pass: string): Promise<any>;
}
