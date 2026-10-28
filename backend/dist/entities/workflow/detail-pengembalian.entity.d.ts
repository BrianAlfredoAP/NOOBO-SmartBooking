export declare class DetailPengembalian {
    private _id_detail_pengembalian;
    private _id_sbpg;
    private _id_alokasi_ruangan;
    private _id_alokasi_logistik;
    private _jumlah_dikembalikan;
    private _kondisi_kembali;
    private _catatan;
    constructor(id_detail_pengembalian: number, id_sbpg: number, id_alokasi_ruangan: number, id_alokasi_logistik: number, jumlah_dikembalikan: number, kondisi_kembali: string, catatan?: string);
    get id_detail_pengembalian(): number;
    get id_sbpg(): number;
    get id_alokasi_ruangan(): number;
    get id_alokasi_logistik(): number;
    get jumlah_dikembalikan(): number;
    get kondisi_kembali(): string;
    get catatan(): string;
    addDetail(): boolean;
    updateDetail(data?: Partial<{
        jumlah_dikembalikan: number;
        kondisi_kembali: string;
        catatan: string;
    }>): boolean;
    validate(): boolean;
}
