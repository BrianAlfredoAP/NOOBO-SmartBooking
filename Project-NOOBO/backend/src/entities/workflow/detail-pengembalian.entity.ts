export class DetailPengembalian {
  private _id_detail_pengembalian: number;
  private _id_sbpg: number;
  private _id_alokasi_ruangan: number;
  private _id_alokasi_logistik: number;
  private _jumlah_dikembalikan: number;
  private _kondisi_kembali: string;
  private _catatan: string;

  constructor(
    id_detail_pengembalian: number,
    id_sbpg: number,
    id_alokasi_ruangan: number,
    id_alokasi_logistik: number,
    jumlah_dikembalikan: number,
    kondisi_kembali: string,
    catatan: string = '',
  ) {
    this._id_detail_pengembalian = id_detail_pengembalian;
    this._id_sbpg = id_sbpg;
    this._id_alokasi_ruangan = id_alokasi_ruangan;
    this._id_alokasi_logistik = id_alokasi_logistik;
    this._jumlah_dikembalikan = jumlah_dikembalikan;
    this._kondisi_kembali = kondisi_kembali;
    this._catatan = catatan;
  }

  public get id_detail_pengembalian(): number {
    return this._id_detail_pengembalian;
  }

  public get id_sbpg(): number {
    return this._id_sbpg;
  }

  public get id_alokasi_ruangan(): number {
    return this._id_alokasi_ruangan;
  }

  public get id_alokasi_logistik(): number {
    return this._id_alokasi_logistik;
  }

  public get jumlah_dikembalikan(): number {
    return this._jumlah_dikembalikan;
  }

  public get kondisi_kembali(): string {
    return this._kondisi_kembali;
  }

  public get catatan(): string {
    return this._catatan;
  }

  public addDetail(): boolean {
    return this._id_sbpg > 0 && this._jumlah_dikembalikan >= 0;
  }

  public updateDetail(data?: Partial<{ jumlah_dikembalikan: number; kondisi_kembali: string; catatan: string }>): boolean {
    if (data) {
      if (data.jumlah_dikembalikan !== undefined) this._jumlah_dikembalikan = data.jumlah_dikembalikan;
      if (data.kondisi_kembali) this._kondisi_kembali = data.kondisi_kembali;
      if (data.catatan !== undefined) this._catatan = data.catatan;
    }
    return true;
  }

  public validate(): boolean {
    return Boolean(this._id_sbpg > 0 && this._kondisi_kembali);
  }
}
