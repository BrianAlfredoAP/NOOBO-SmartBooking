export declare class AlokasiLogistik {
    private _id_alokasi_logistik;
    private _id_pengajuan;
    private _id_logistik;
    private _jumlah_dialokasikan;
    private _tanggal_mulai;
    private _tanggal_selesai;
    private _status_alokasi;
    constructor(id_alokasi_logistik: number, id_pengajuan: number, id_logistik: number, jumlah_dialokasikan: number, tanggal_mulai: Date, tanggal_selesai: Date, status_alokasi?: string);
    get id_alokasi_logistik(): number;
    get id_pengajuan(): number;
    get id_logistik(): number;
    get jumlah_dialokasikan(): number;
    get tanggal_mulai(): Date;
    get tanggal_selesai(): Date;
    get status_alokasi(): string;
    allocate(): boolean;
    release(): boolean;
    update(jumlah?: number, status?: string): boolean;
}
