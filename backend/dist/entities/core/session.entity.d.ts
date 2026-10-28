export declare class Session {
    private _id_session;
    private _id_user;
    private _token_hash;
    private _waktu_dibuat;
    private _waktu_kedaluwarsa;
    private _status;
    constructor(id_session: number, id_user: number, token_hash: string, waktu_dibuat?: Date, waktu_kedaluwarsa?: Date, status?: string);
    get id_session(): number;
    get id_user(): number;
    get waktu_dibuat(): Date;
    get waktu_kedaluwarsa(): Date;
    get status(): string;
    getTokenHash(): string;
    createSession(userId: number): string;
    validateSession(token: string): boolean;
    invalidateSession(sessionId: number): boolean;
}
