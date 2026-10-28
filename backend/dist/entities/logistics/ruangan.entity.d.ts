export declare class Ruangan {
    private _id_ruangan;
    private _nama_ruangan;
    private _jenis;
    private _lokasi;
    private _kapasitas;
    private _kondisi_fasilitas;
    private _status_aktif;
    constructor(id_ruangan: number, nama_ruangan: string, jenis: string, lokasi: string, kapasitas: number, kondisi_fasilitas: string, status_aktif?: boolean);
    get id_ruangan(): number;
    get nama_ruangan(): string;
    get jenis(): string;
    get lokasi(): string;
    get kapasitas(): number;
    get kondisi_fasilitas(): string;
    get status_aktif(): boolean;
    updateStatus(status: boolean): boolean;
    viewDetail(): object;
}
