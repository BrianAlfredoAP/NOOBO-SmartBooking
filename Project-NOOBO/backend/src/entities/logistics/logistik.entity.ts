export class Logistik {
  private _id_logistik: number;
  private _nama_logistik: string;
  private _jenis: string;
  private _stok_total: number;
  private _kondisi_fasilitas: string;
  private _status_aktif: boolean;

  constructor(
    id_logistik: number,
    nama_logistik: string,
    jenis: string,
    stok_total: number,
    kondisi_fasilitas: string,
    status_aktif: boolean = true,
  ) {
    this._id_logistik = id_logistik;
    this._nama_logistik = nama_logistik;
    this._jenis = jenis;
    this._stok_total = stok_total;
    this._kondisi_fasilitas = kondisi_fasilitas;
    this._status_aktif = status_aktif;
  }

  public get id_logistik(): number {
    return this._id_logistik;
  }

  public get nama_logistik(): string {
    return this._nama_logistik;
  }

  public get jenis(): string {
    return this._jenis;
  }

  public get stok_total(): number {
    return this._stok_total;
  }

  public get kondisi_fasilitas(): string {
    return this._kondisi_fasilitas;
  }

  public get status_aktif(): boolean {
    return this._status_aktif;
  }

  public updateStok(qty: number): boolean {
    if (this._stok_total + qty >= 0) {
      this._stok_total += qty;
      return true;
    }
    return false;
  }

  public viewDetail(): object {
    return {
      id_logistik: this._id_logistik,
      nama_logistik: this._nama_logistik,
      jenis: this._jenis,
      stok_total: this._stok_total,
      kondisi_fasilitas: this._kondisi_fasilitas,
      status_aktif: this._status_aktif,
    };
  }
}
