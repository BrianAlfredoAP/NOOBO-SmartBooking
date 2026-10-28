export declare class AlokasiRuangan {
    private _id_alokasi_ruangan;
    private _id_pengajuan;
    private _id_ruangan;
    private _tanggal_mulai;
    private _tanggal_selesai;
    private _status_alokasi;
    constructor(id_alokasi_ruangan: number, id_pengajuan: number, id_ruangan: number, tanggal_mulai: Date, tanggal_selesai: Date, status_alokasi?: string);
    get id_alokasi_ruangan(): number;
    get id_pengajuan(): number;
    get id_ruangan(): number;
    get tanggal_mulai(): Date;
    get tanggal_selesai(): Date;
    get status_alokasi(): string;
    allocate(): boolean;
    release(): boolean;
    update(status?: string): boolean;
}
