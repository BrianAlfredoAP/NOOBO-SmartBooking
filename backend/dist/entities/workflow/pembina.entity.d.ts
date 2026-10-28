export declare class Pembina {
    private _id_pembina;
    private _nama_pembina;
    private _email_pembina;
    private _status_aktif;
    constructor(id_pembina: number, nama_pembina: string, email_pembina: string, status_aktif?: boolean);
    get id_pembina(): number;
    get nama_pembina(): string;
    get email_pembina(): string;
    get status_aktif(): boolean;
    approve(idPengajuan: number): boolean;
    reject(idPengajuan: number): boolean;
    viewPengajuan(): Array<object>;
}
