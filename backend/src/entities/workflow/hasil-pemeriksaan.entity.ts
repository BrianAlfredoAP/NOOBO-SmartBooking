export class HasilPemeriksaan {
  private _id_hasil_pemeriksaan: number;
  private _id_pengajuan: number;
  private _id_sbpg: number;
  private _id_user_pemeriksa: number;
  private _waktu_pemeriksaan: Date;
  private _status_pemeriksaan: string;
  private _catatan: string;

  constructor(
    id_hasil_pemeriksaan: number,
    id_pengajuan: number,
    id_sbpg: number,
    id_user_pemeriksa: number,
    waktu_pemeriksaan: Date = new Date(),
    status_pemeriksaan: string = 'IN_PROGRESS',
    catatan: string = '',
  ) {
    this._id_hasil_pemeriksaan = id_hasil_pemeriksaan;
    this._id_pengajuan = id_pengajuan;
    this._id_sbpg = id_sbpg;
    this._id_user_pemeriksa = id_user_pemeriksa;
    this._waktu_pemeriksaan = waktu_pemeriksaan;
    this._status_pemeriksaan = status_pemeriksaan;
    this._catatan = catatan;
  }

  public get id_hasil_pemeriksaan(): number {
    return this._id_hasil_pemeriksaan;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_sbpg(): number {
    return this._id_sbpg;
  }

  public get id_user_pemeriksa(): number {
    return this._id_user_pemeriksa;
  }

  public get waktu_pemeriksaan(): Date {
    return this._waktu_pemeriksaan;
  }

  public get status_pemeriksaan(): string {
    return this._status_pemeriksaan;
  }

  public get catatan(): string {
    return this._catatan;
  }

  public inspect(): boolean {
    this._status_pemeriksaan = 'IN_PROGRESS';
    this._waktu_pemeriksaan = new Date();
    return true;
  }

  public updateStatus(status?: string): boolean {
    if (status) {
      this._status_pemeriksaan = status;
    }
    return true;
  }

  public complete(): boolean {
    this._status_pemeriksaan = 'COMPLETED';
    this._waktu_pemeriksaan = new Date();
    return true;
  }
}
