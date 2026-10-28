export declare class User {
    private _id_user;
    private _role_id;
    private _nama;
    private _email;
    private _password_hash;
    private _status_aktif;
    private _created_at;
    constructor(id_user: number, role_id: number, nama: string, email: string, password_hash: string, status_aktif?: boolean, created_at?: Date);
    get id_user(): number;
    get role_id(): number;
    get nama(): string;
    get email(): string;
    get status_aktif(): boolean;
    get created_at(): Date;
    verifyPasswordHash(hash: string): boolean;
    getPasswordHash(): string;
    login(email: string, pass: string): boolean;
    logout(sessionId: number): boolean;
    updateProfil(newData: Partial<User>): boolean;
    viewDashboard(): object;
}
