export declare class PaketRuangan {
    private _id_paket_ruangan;
    private _id_paket;
    private _id_ruangan;
    constructor(id_paket_ruangan: number, id_paket: number, id_ruangan: number);
    get id_paket_ruangan(): number;
    get id_paket(): number;
    get id_ruangan(): number;
    addRoom(): boolean;
    removeRoom(): boolean;
}
