function parseFasilitas(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || value.length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export class Ruangan {
  private _id_ruangan: number;
  private _nama_ruangan: string;
  private _jenis: string;
  private _lokasi: string;
  private _kapasitas: number;
  private _kondisi_fasilitas: string;
  private _status_aktif: boolean;
  private _kode_ruangan: string;
  private _gedung: string;
  private _lantai: string;
  private _fasilitas: string[];
  private _foto: string;
  private _deskripsi: string;

  constructor(
    id_ruangan: number,
    nama_ruangan: string,
    jenis: string,
    lokasi: string,
    kapasitas: number,
    kondisi_fasilitas: string,
    status_aktif: boolean = true,
    kode_ruangan: string = '',
    gedung: string = '',
    lantai: string = '',
    fasilitas: string[] = [],
    foto: string = '',
    deskripsi: string = '',
  ) {
    this._id_ruangan = id_ruangan;
    this._nama_ruangan = nama_ruangan;
    this._jenis = jenis;
    this._lokasi = lokasi;
    this._kapasitas = kapasitas;
    this._kondisi_fasilitas = kondisi_fasilitas;
    this._status_aktif = status_aktif;
    this._kode_ruangan = kode_ruangan;
    this._gedung = gedung;
    this._lantai = lantai;
    this._fasilitas = fasilitas;
    this._foto = foto;
    this._deskripsi = deskripsi;
  }

  public get id_ruangan(): number {
    return this._id_ruangan;
  }

  public get nama_ruangan(): string {
    return this._nama_ruangan;
  }

  public get jenis(): string {
    return this._jenis;
  }

  public get lokasi(): string {
    return this._lokasi;
  }

  public get kapasitas(): number {
    return this._kapasitas;
  }

  public get kondisi_fasilitas(): string {
    return this._kondisi_fasilitas;
  }

  public get status_aktif(): boolean {
    return this._status_aktif;
  }

  public get kode_ruangan(): string {
    return this._kode_ruangan;
  }

  public get gedung(): string {
    return this._gedung;
  }

  public get lantai(): string {
    return this._lantai;
  }

  public get fasilitas(): string[] {
    return this._fasilitas;
  }

  public get foto(): string {
    return this._foto;
  }

  public get deskripsi(): string {
    return this._deskripsi;
  }

  public updateStatus(status: boolean): boolean {
    if (status === this._status_aktif) return false;
    if (status && this._kondisi_fasilitas === 'Rusak') return false;
    this._status_aktif = status;
    return true;
  }

  static fromRow(row: Record<string, unknown>): Ruangan {
    return new Ruangan(
      Number(row.id_ruangan),
      String(row.nama_ruangan),
      String(row.jenis),
      String(row.lokasi),
      Number(row.kapasitas),
      String(row.kondisi_fasilitas),
      Boolean(row.status_aktif),
      row.kode_ruangan == null ? '' : String(row.kode_ruangan as string | number),
      row.gedung == null ? '' : String(row.gedung as string | number),
      row.lantai == null ? '' : String(row.lantai as string | number),
      parseFasilitas(row.fasilitas),
      row.foto == null ? '' : String(row.foto as string | number),
      row.deskripsi == null ? '' : String(row.deskripsi as string | number),
    );
  }

  public viewDetail(): object {
    return {
      id_ruangan: this._id_ruangan,
      nama_ruangan: this._nama_ruangan,
      jenis: this._jenis,
      lokasi: this._lokasi,
      kode_ruangan: this._kode_ruangan,
      gedung: this._gedung,
      lantai: this._lantai,
      fasilitas: this._fasilitas,
      foto: this._foto,
      deskripsi: this._deskripsi,
      kapasitas: this._kapasitas,
      kondisi_fasilitas: this._kondisi_fasilitas,
      status_aktif: this._status_aktif,
    };
  }
}
