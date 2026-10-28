export declare class TokenKeputusan {
    private _id_notifikasi;
    private _id_pengajuan;
    private _id_token;
    private _dibuat_pada;
    private _kedaluwarsa_pada;
    private _waktu_digunakan;
    private _status;
    private _token_value;
    constructor(id_notifikasi: number, id_pengajuan: number, id_token: number, dibuat_pada?: Date, kedaluwarsa_pada?: Date, waktu_digunakan?: Date | null, status?: string, token_value?: string);
    get id_notifikasi(): number;
    get id_pengajuan(): number;
    get id_token(): number;
    get dibuat_pada(): Date;
    get kedaluwarsa_pada(): Date;
    get waktu_digunakan(): Date | null;
    get status(): string;
    generateToken(): string;
    validateToken(): boolean;
    markAsUsed(): boolean;
}
