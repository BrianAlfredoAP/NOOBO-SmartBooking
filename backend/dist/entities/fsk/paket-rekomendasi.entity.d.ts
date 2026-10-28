export declare class PaketRekomendasi {
    private _id_paket;
    private _id_fsk;
    private _nama_paket;
    private _skor;
    private _alasan;
    private _dipilih;
    private _dibuat_pada;
    constructor(id_paket: number, id_fsk: number, nama_paket: string, skor: number, alasan: string, dipilih?: boolean, dibuat_pada?: Date);
    get id_paket(): number;
    get id_fsk(): number;
    get nama_paket(): string;
    get skor(): number;
    get alasan(): string;
    get dipilih(): boolean;
    get dibuat_pada(): Date;
    generate(fskId: number): object;
    select(): boolean;
    update(data?: Partial<{
        nama_paket: string;
        skor: number;
        alasan: string;
    }>): boolean;
    delete(): boolean;
}
