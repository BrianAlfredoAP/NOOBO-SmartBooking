export declare class AturanPeminjaman {
    private _id_aturan;
    private _nama_aturan;
    private _deskripsi;
    private _ketentuan;
    private _aktif;
    constructor(id_aturan: number, nama_aturan: string, deskripsi: string, ketentuan: string, aktif?: boolean);
    get id_aturan(): number;
    get nama_aturan(): string;
    get deskripsi(): string;
    get ketentuan(): string;
    get aktif(): boolean;
    create(): boolean;
    update(data?: Partial<{
        nama_aturan: string;
        deskripsi: string;
        ketentuan: string;
        aktif: boolean;
    }>): boolean;
    delete(): boolean;
}
