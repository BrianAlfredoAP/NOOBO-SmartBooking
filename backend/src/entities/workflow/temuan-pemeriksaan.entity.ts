export class TemuanPemeriksaan {
  private _id_temuan: number;
  private _id_hasil_pemeriksaan: number;
  private _id_logistik: number;
  private _id_ruangan: number;
  private _jenis_temuan: string;
  private _jumlah: number;
  private _deskripsi: string;
  private _foto_bukti: string;

  constructor(
    id_temuan: number,
    id_hasil_pemeriksaan: number,
    id_logistik: number,
    id_ruangan: number,
    jenis_temuan: string,
    jumlah: number,
    deskripsi: string,
    foto_bukti: string = '',
  ) {
    this._id_temuan = id_temuan;
    this._id_hasil_pemeriksaan = id_hasil_pemeriksaan;
    this._id_logistik = id_logistik;
    this._id_ruangan = id_ruangan;
    this._jenis_temuan = jenis_temuan;
    this._jumlah = jumlah;
    this._deskripsi = deskripsi;
    this._foto_bukti = foto_bukti;
  }

  public get id_temuan(): number {
    return this._id_temuan;
  }

  public get id_hasil_pemeriksaan(): number {
    return this._id_hasil_pemeriksaan;
  }

  public get id_logistik(): number {
    return this._id_logistik;
  }

  public get id_ruangan(): number {
    return this._id_ruangan;
  }

  public get jenis_temuan(): string {
    return this._jenis_temuan;
  }

  public get jumlah(): number {
    return this._jumlah;
  }

  public get deskripsi(): string {
    return this._deskripsi;
  }

  public get foto_bukti(): string {
    return this._foto_bukti;
  }

  public addTemuan(): boolean {
    return this._id_hasil_pemeriksaan > 0 && Boolean(this._jenis_temuan);
  }

  public updateTemuan(data?: Partial<{ jenis_temuan: string; jumlah: number; deskripsi: string; foto_bukti: string }>): boolean {
    if (data) {
      if (data.jenis_temuan) this._jenis_temuan = data.jenis_temuan;
      if (data.jumlah !== undefined) this._jumlah = data.jumlah;
      if (data.deskripsi !== undefined) this._deskripsi = data.deskripsi;
      if (data.foto_bukti !== undefined) this._foto_bukti = data.foto_bukti;
    }
    return true;
  }

  public deleteTemuan(): boolean {
    this._jumlah = 0;
    return true;
  }
}
