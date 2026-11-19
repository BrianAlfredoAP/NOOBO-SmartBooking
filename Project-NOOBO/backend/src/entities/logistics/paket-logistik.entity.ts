export class PaketLogistik {
  private _id_paket_logistik: number;
  private _id_paket: number;
  private _id_logistik: number;
  private _jumlah: number;

  constructor(id_paket_logistik: number, id_paket: number, id_logistik: number, jumlah: number) {
    this._id_paket_logistik = id_paket_logistik;
    this._id_paket = id_paket;
    this._id_logistik = id_logistik;
    this._jumlah = jumlah;
  }

  public get id_paket_logistik(): number {
    return this._id_paket_logistik;
  }

  public get id_paket(): number {
    return this._id_paket;
  }

  public get id_logistik(): number {
    return this._id_logistik;
  }

  public get jumlah(): number {
    return this._jumlah;
  }

  public addLogistic(): boolean {
    return this._id_paket > 0 && this._id_logistik > 0 && this._jumlah > 0;
  }

  public updateJumlah(jumlah: number): boolean {
    if (jumlah >= 0) {
      this._jumlah = jumlah;
      return true;
    }
    return false;
  }

  public removeLogistic(): boolean {
    this._jumlah = 0;
    return true;
  }
}
