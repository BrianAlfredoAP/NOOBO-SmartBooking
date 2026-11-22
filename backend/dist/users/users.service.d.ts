import { UsersRepository } from './users.repository.js';
import type { UserRecord } from './users.types.js';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: UsersRepository);
    findByEmail(email: string): Promise<UserRecord | null>;
    findById(id: number): Promise<UserRecord | null>;
}
