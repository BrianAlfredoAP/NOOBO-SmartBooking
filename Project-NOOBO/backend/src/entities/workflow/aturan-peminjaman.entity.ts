export class AturanPeminjaman {
  private _id_aturan: number;
  private _nama_aturan: string;
  private _deskripsi: string;
  private _ketentuan: string;
  private _aktif: boolean;

  constructor(
    id_aturan: number,
    nama_aturan: string,
    deskripsi: string,
    ketentuan: string,
    aktif: boolean = true,
  ) {
    this._id_aturan = id_aturan;
    this._nama_aturan = nama_aturan;
    this._deskripsi = deskripsi;
    this._ketentuan = ketentuan;
    this._aktif = aktif;
  }

  public get id_aturan(): number {
    return this._id_aturan;
  }

  public get nama_aturan(): string {
    return this._nama_aturan;
  }

  public get deskripsi(): string {
    return this._deskripsi;
  }

  public get ketentuan(): string {
    return this._ketentuan;
  }

  public get aktif(): boolean {
    return this._aktif;
  }

  public create(): boolean {
    return Boolean(this._nama_aturan && this._ketentuan);
  }

  public update(data?: Partial<{ nama_aturan: string; deskripsi: string; ketentuan: string; aktif: boolean }>): boolean {
    if (data) {
      if (data.nama_aturan) this._nama_aturan = data.nama_aturan;
      if (data.deskripsi !== undefined) this._deskripsi = data.deskripsi;
      if (data.ketentuan) this._ketentuan = data.ketentuan;
      if (data.aktif !== undefined) this._aktif = data.aktif;
    }
    return true;
  }

  public delete(): boolean {
    this._aktif = false;
    return true;
  }
}
