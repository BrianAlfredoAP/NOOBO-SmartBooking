export declare class DetailKebutuhanFsk {
    private _id_detail_kebutuhan;
    private _id_fsk;
    private _kategori;
    private _jenis_kebutuhan;
    private _jumlah;
    private _keterangan;
    constructor(id_detail_kebutuhan: number, id_fsk: number, kategori: string, jenis_kebutuhan: string, jumlah: number, keterangan: string);
    get id_detail_kebutuhan(): number;
    get id_fsk(): number;
    get kategori(): string;
    get jenis_kebutuhan(): string;
    get jumlah(): number;
    get keterangan(): string;
    addDetail(): boolean;
    updateDetail(data?: Partial<{
        kategori: string;
        jenis_kebutuhan: string;
        jumlah: number;
        keterangan: string;
    }>): boolean;
    deleteDetail(): boolean;
}
