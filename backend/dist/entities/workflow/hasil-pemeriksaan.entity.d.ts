export declare class HasilPemeriksaan {
    private _id_hasil_pemeriksaan;
    private _id_pengajuan;
    private _id_sbpg;
    private _id_user_pemeriksa;
    private _waktu_pemeriksaan;
    private _status_pemeriksaan;
    private _catatan;
    constructor(id_hasil_pemeriksaan: number, id_pengajuan: number, id_sbpg: number, id_user_pemeriksa: number, waktu_pemeriksaan?: Date, status_pemeriksaan?: string, catatan?: string);
    get id_hasil_pemeriksaan(): number;
    get id_pengajuan(): number;
    get id_sbpg(): number;
    get id_user_pemeriksa(): number;
    get waktu_pemeriksaan(): Date;
    get status_pemeriksaan(): string;
    get catatan(): string;
    inspect(): boolean;
    updateStatus(status?: string): boolean;
    complete(): boolean;
}
