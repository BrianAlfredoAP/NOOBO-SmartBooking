export declare class SpesifikasiKebutuhan {
    private _id_fsk;
    private _id_user;
    private _nama_kegiatan;
    private _tanggal_mulai;
    private _tanggal_selesai;
    private _waktu_mulai;
    private _waktu_selesai;
    private _jumlah_peserta;
    private _tujuan_kegiatan;
    private _status;
    private _created_at;
    constructor(id_fsk: number, id_user: number, nama_kegiatan: string, tanggal_mulai: Date, tanggal_selesai: Date, waktu_mulai: string, waktu_selesai: string, jumlah_peserta: number, tujuan_kegiatan: string, status?: string, created_at?: Date);
    get id_fsk(): number;
    get id_user(): number;
    get nama_kegiatan(): string;
    get tanggal_mulai(): Date;
    get tanggal_selesai(): Date;
    get waktu_mulai(): string;
    get waktu_selesai(): string;
    get jumlah_peserta(): number;
    get tujuan_kegiatan(): string;
    get status(): string;
    get created_at(): Date;
    create(data: Record<string, any>): boolean;
    update(id: number, data: Record<string, any>): boolean;
    validate(): boolean;
    viewDetail(id: number): object;
}
