export declare class TemuanPemeriksaan {
    private _id_temuan;
    private _id_hasil_pemeriksaan;
    private _id_logistik;
    private _id_ruangan;
    private _jenis_temuan;
    private _jumlah;
    private _deskripsi;
    private _foto_bukti;
    constructor(id_temuan: number, id_hasil_pemeriksaan: number, id_logistik: number, id_ruangan: number, jenis_temuan: string, jumlah: number, deskripsi: string, foto_bukti?: string);
    get id_temuan(): number;
    get id_hasil_pemeriksaan(): number;
    get id_logistik(): number;
    get id_ruangan(): number;
    get jenis_temuan(): string;
    get jumlah(): number;
    get deskripsi(): string;
    get foto_bukti(): string;
    addTemuan(): boolean;
    updateTemuan(data?: Partial<{
        jenis_temuan: string;
        jumlah: number;
        deskripsi: string;
        foto_bukti: string;
    }>): boolean;
    deleteTemuan(): boolean;
}
