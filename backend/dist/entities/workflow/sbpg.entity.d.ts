export declare class Sbpg {
    private _id_sbpg;
    private _id_pengajuan;
    private _batas_waktu_kirim;
    private _waktu_kirim;
    private _status_ketepatan_waktu;
    private _catatan_peminjam;
    private _foto_kerusakan;
    constructor(id_sbpg: number, id_pengajuan: number, batas_waktu_kirim: Date, waktu_kirim?: Date, status_ketepatan_waktu?: string, catatan_peminjam?: string, foto_kerusakan?: string);
    get id_sbpg(): number;
    get id_pengajuan(): number;
    get batas_waktu_kirim(): Date;
    get waktu_kirim(): Date;
    get status_ketepatan_waktu(): string;
    get catatan_peminjam(): string;
    get foto_kerusakan(): string;
    generate(): object;
    save(): boolean;
    uploadFoto(path: string): boolean;
}
