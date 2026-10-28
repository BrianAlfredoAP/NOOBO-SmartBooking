export declare class PaketLogistik {
    private _id_paket_logistik;
    private _id_paket;
    private _id_logistik;
    private _jumlah;
    constructor(id_paket_logistik: number, id_paket: number, id_logistik: number, jumlah: number);
    get id_paket_logistik(): number;
    get id_paket(): number;
    get id_logistik(): number;
    get jumlah(): number;
    addLogistic(): boolean;
    updateJumlah(jumlah: number): boolean;
    removeLogistic(): boolean;
}
