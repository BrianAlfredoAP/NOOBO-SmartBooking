export class AlokasiLogistik {
  private _id_alokasi_logistik: number;
  private _id_pengajuan: number;
  private _id_logistik: number;
  private _jumlah_dialokasikan: number;
  private _tanggal_mulai: Date;
  private _tanggal_selesai: Date;
  private _status_alokasi: string;

  constructor(
    id_alokasi_logistik: number,
    id_pengajuan: number,
    id_logistik: number,
    jumlah_dialokasikan: number,
    tanggal_mulai: Date,
    tanggal_selesai: Date,
    status_alokasi: string = 'ALLOCATED',
  ) {
    this._id_alokasi_logistik = id_alokasi_logistik;
    this._id_pengajuan = id_pengajuan;
    this._id_logistik = id_logistik;
    this._jumlah_dialokasikan = jumlah_dialokasikan;
    this._tanggal_mulai = tanggal_mulai;
    this._tanggal_selesai = tanggal_selesai;
    this._status_alokasi = status_alokasi;
  }

  public get id_alokasi_logistik(): number {
    return this._id_alokasi_logistik;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_logistik(): number {
    return this._id_logistik;
  }

  public get jumlah_dialokasikan(): number {
    return this._jumlah_dialokasikan;
  }

  public get tanggal_mulai(): Date {
    return this._tanggal_mulai;
  }

  public get tanggal_selesai(): Date {
    return this._tanggal_selesai;
  }

  public get status_alokasi(): string {
    return this._status_alokasi;
  }

  public allocate(): boolean {
    this._status_alokasi = 'ALLOCATED';
    return true;
  }

  public release(): boolean {
    this._status_alokasi = 'RELEASED';
    return true;
  }

  public update(jumlah?: number, status?: string): boolean {
    if (jumlah !== undefined) this._jumlah_dialokasikan = jumlah;
    if (status) this._status_alokasi = status;
    return true;
  }
}
