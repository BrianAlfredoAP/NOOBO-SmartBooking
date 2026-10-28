export declare class KeputusanLogistik {
    private _id_keputusan_logistik;
    private _id_pengajuan;
    private _id_user_logistik;
    private _keputusan;
    private _alasan;
    private _waktu_keputusan;
    constructor(id_keputusan_logistik: number, id_pengajuan: number, id_user_logistik: number, keputusan?: string, alasan?: string, waktu_keputusan?: Date);
    get id_keputusan_logistik(): number;
    get id_pengajuan(): number;
    get id_user_logistik(): number;
    get keputusan(): string;
    get alasan(): string;
    get waktu_keputusan(): Date;
    approve(): boolean;
    reject(alasan?: string): boolean;
    update(keputusan?: string, alasan?: string): boolean;
}
