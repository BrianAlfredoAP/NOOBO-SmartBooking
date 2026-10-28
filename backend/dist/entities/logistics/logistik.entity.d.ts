export declare class Logistik {
    private _id_logistik;
    private _nama_logistik;
    private _jenis;
    private _stok_total;
    private _kondisi_fasilitas;
    private _status_aktif;
    constructor(id_logistik: number, nama_logistik: string, jenis: string, stok_total: number, kondisi_fasilitas: string, status_aktif?: boolean);
    get id_logistik(): number;
    get nama_logistik(): string;
    get jenis(): string;
    get stok_total(): number;
    get kondisi_fasilitas(): string;
    get status_aktif(): boolean;
    updateStok(qty: number): boolean;
    viewDetail(): object;
}
