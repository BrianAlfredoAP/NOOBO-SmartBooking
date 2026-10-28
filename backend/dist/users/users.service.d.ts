export interface UserRecord {
    id_user: number;
    role_id: number;
    role: string;
    nama: string;
    email: string;
    password_hash: string;
    status_aktif: boolean;
    created_at: Date;
}
export declare class UsersService {
    private users;
    constructor();
    private seedDefaultUsers;
    findByEmail(email: string): Promise<UserRecord | undefined>;
    findById(id: number): Promise<UserRecord | undefined>;
    createUser(data: Omit<UserRecord, 'id_user' | 'created_at'>): Promise<UserRecord>;
}
