export declare class Sbp {
    private _id_sbp;
    private _id_pengajuan;
    private _id_user_penerbit;
    private _nomor_sbp;
    private _tanggal_terbit;
    private _lokasi_dokumen;
    constructor(id_sbp: number, id_pengajuan: number, id_user_penerbit: number, nomor_sbp: string, tanggal_terbit?: Date, lokasi_dokumen?: string);
    get id_sbp(): number;
    get id_pengajuan(): number;
    get id_user_penerbit(): number;
    get nomor_sbp(): string;
    get tanggal_terbit(): Date;
    get lokasi_dokumen(): string;
    generate(): object;
    save(): boolean;
    download(): string;
}
