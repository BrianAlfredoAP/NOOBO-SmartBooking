export class PaketRuangan {
  private _id_paket_ruangan: number;
  private _id_paket: number;
  private _id_ruangan: number;

  constructor(id_paket_ruangan: number, id_paket: number, id_ruangan: number) {
    this._id_paket_ruangan = id_paket_ruangan;
    this._id_paket = id_paket;
    this._id_ruangan = id_ruangan;
  }

  public get id_paket_ruangan(): number {
    return this._id_paket_ruangan;
  }

  public get id_paket(): number {
    return this._id_paket;
  }

  public get id_ruangan(): number {
    return this._id_ruangan;
  }

  public addRoom(): boolean {
    return this._id_paket > 0 && this._id_ruangan > 0;
  }

  public removeRoom(): boolean {
    return true;
  }
}
