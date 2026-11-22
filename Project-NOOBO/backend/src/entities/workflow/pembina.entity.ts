export class Pembina {
  private _id_pembina: number;
  private _nama_pembina: string;
  private _email_pembina: string;
  private _status_aktif: boolean;

  constructor(id_pembina: number, nama_pembina: string, email_pembina: string, status_aktif: boolean = true) {
    this._id_pembina = id_pembina;
    this._nama_pembina = nama_pembina;
    this._email_pembina = email_pembina;
    this._status_aktif = status_aktif;
  }

  public get id_pembina(): number {
    return this._id_pembina;
  }

  public get nama_pembina(): string {
    return this._nama_pembina;
  }

  public get email_pembina(): string {
    return this._email_pembina;
  }

  public get status_aktif(): boolean {
    return this._status_aktif;
  }

  public approve(idPengajuan: number): boolean {
    return this._status_aktif && idPengajuan > 0;
  }

  public reject(idPengajuan: number): boolean {
    return this._status_aktif && idPengajuan > 0;
  }

  public viewPengajuan(): Array<object> {
    return [
      {
        pembinaId: this._id_pembina,
        nama: this._nama_pembina,
        email: this._email_pembina,
        status: this._status_aktif,
      },
    ];
  }
}
