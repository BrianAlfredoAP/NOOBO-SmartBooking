export class AlokasiRuangan {
  private _id_alokasi_ruangan: number;
  private _id_pengajuan: number;
  private _id_ruangan: number;
  private _tanggal_mulai: Date;
  private _tanggal_selesai: Date;
  private _status_alokasi: string;

  constructor(
    id_alokasi_ruangan: number,
    id_pengajuan: number,
    id_ruangan: number,
    tanggal_mulai: Date,
    tanggal_selesai: Date,
    status_alokasi: string = 'ALLOCATED',
  ) {
    this._id_alokasi_ruangan = id_alokasi_ruangan;
    this._id_pengajuan = id_pengajuan;
    this._id_ruangan = id_ruangan;
    this._tanggal_mulai = tanggal_mulai;
    this._tanggal_selesai = tanggal_selesai;
    this._status_alokasi = status_alokasi;
  }

  public get id_alokasi_ruangan(): number {
    return this._id_alokasi_ruangan;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_ruangan(): number {
    return this._id_ruangan;
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

  public update(status?: string): boolean {
    if (status) {
      this._status_alokasi = status;
    }
    return true;
  }
}
