export class Logistik {
  private _id_logistik: number;
  private _nama_logistik: string;
  private _jenis: string;
  private _stok_total: number;
  private _kondisi_fasilitas: string;
  private _status_aktif: boolean;
  private _kode_logistik: string;
  private _lokasi: string;
  private _satuan: string;
  private _foto: string;
  private _deskripsi: string;

  constructor(
    id_logistik: number,
    nama_logistik: string,
    jenis: string,
    stok_total: number,
    kondisi_fasilitas: string,
    status_aktif: boolean = true,
    kode_logistik: string = '',
    lokasi: string = '',
    satuan: string = 'unit',
    foto: string = '',
    deskripsi: string = '',
  ) {
    this._id_logistik = id_logistik;
    this._nama_logistik = nama_logistik;
    this._jenis = jenis;
    this._stok_total = stok_total;
    this._kondisi_fasilitas = kondisi_fasilitas;
    this._status_aktif = status_aktif;
    this._kode_logistik = kode_logistik;
    this._lokasi = lokasi;
    this._satuan = satuan;
    this._foto = foto;
    this._deskripsi = deskripsi;
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

  public get kode_logistik(): string {
    return this._kode_logistik;
  }

  public get lokasi(): string {
    return this._lokasi;
  }

  public get satuan(): string {
    return this._satuan;
  }

  public get foto(): string {
    return this._foto;
  }

  public get deskripsi(): string {
    return this._deskripsi;
  }

  public updateStok(qty: number): boolean {
    if (!Number.isInteger(qty) || qty === 0 || this._stok_total + qty < 0) return false;
    this._stok_total += qty;
    return true;
  }

  static fromRow(row: Record<string, unknown>): Logistik {
    return new Logistik(
      Number(row.id_logistik),
      String(row.nama_logistik),
      String(row.jenis),
      Number(row.stok_total),
      String(row.kondisi_fasilitas),
      Boolean(row.status_aktif),
      row.kode_logistik == null ? '' : String(row.kode_logistik as string | number),
      row.lokasi == null ? '' : String(row.lokasi as string | number),
      row.satuan == null ? 'unit' : String(row.satuan as string | number),
      row.foto == null ? '' : String(row.foto as string | number),
      row.deskripsi == null ? '' : String(row.deskripsi as string | number),
    );
  }

  public viewDetail(): object {
    return {
      id_logistik: this._id_logistik,
      nama_logistik: this._nama_logistik,
      jenis: this._jenis,
      stok_total: this._stok_total,
      kode_logistik: this._kode_logistik,
      lokasi: this._lokasi,
      satuan: this._satuan,
      foto: this._foto,
      deskripsi: this._deskripsi,
      kondisi_fasilitas: this._kondisi_fasilitas,
      status_aktif: this._status_aktif,
    };
  }
}
