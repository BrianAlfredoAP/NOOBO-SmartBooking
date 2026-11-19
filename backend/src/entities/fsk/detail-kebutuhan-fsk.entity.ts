export class DetailKebutuhanFsk {
  private _id_detail_kebutuhan: number;
  private _id_fsk: number;
  private _kategori: string;
  private _jenis_kebutuhan: string;
  private _jumlah: number;
  private _keterangan: string;

  constructor(
    id_detail_kebutuhan: number,
    id_fsk: number,
    kategori: string,
    jenis_kebutuhan: string,
    jumlah: number,
    keterangan: string,
  ) {
    this._id_detail_kebutuhan = id_detail_kebutuhan;
    this._id_fsk = id_fsk;
    this._kategori = kategori;
    this._jenis_kebutuhan = jenis_kebutuhan;
    this._jumlah = jumlah;
    this._keterangan = keterangan;
  }

  public get id_detail_kebutuhan(): number {
    return this._id_detail_kebutuhan;
  }

  public get id_fsk(): number {
    return this._id_fsk;
  }

  public get kategori(): string {
    return this._kategori;
  }

  public get jenis_kebutuhan(): string {
    return this._jenis_kebutuhan;
  }

  public get jumlah(): number {
    return this._jumlah;
  }

  public get keterangan(): string {
    return this._keterangan;
  }

  public addDetail(): boolean {
    return this._id_fsk > 0 && this._jumlah > 0;
  }

  public updateDetail(data?: Partial<{ kategori: string; jenis_kebutuhan: string; jumlah: number; keterangan: string }>): boolean {
    if (data) {
      if (data.kategori) this._kategori = data.kategori;
      if (data.jenis_kebutuhan) this._jenis_kebutuhan = data.jenis_kebutuhan;
      if (data.jumlah !== undefined) this._jumlah = data.jumlah;
      if (data.keterangan !== undefined) this._keterangan = data.keterangan;
    }
    return true;
  }

  public deleteDetail(): boolean {
    this._jumlah = 0;
    return true;
  }
}
