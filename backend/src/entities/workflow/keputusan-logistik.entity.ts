export class KeputusanLogistik {
  private _id_keputusan_logistik: number;
  private _id_pengajuan: number;
  private _id_user_logistik: number;
  private _keputusan: string;
  private _alasan: string;
  private _waktu_keputusan: Date;

  constructor(
    id_keputusan_logistik: number,
    id_pengajuan: number,
    id_user_logistik: number,
    keputusan: string = 'PENDING',
    alasan: string = '',
    waktu_keputusan: Date = new Date(),
  ) {
    this._id_keputusan_logistik = id_keputusan_logistik;
    this._id_pengajuan = id_pengajuan;
    this._id_user_logistik = id_user_logistik;
    this._keputusan = keputusan;
    this._alasan = alasan;
    this._waktu_keputusan = waktu_keputusan;
  }

  public get id_keputusan_logistik(): number {
    return this._id_keputusan_logistik;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_user_logistik(): number {
    return this._id_user_logistik;
  }

  public get keputusan(): string {
    return this._keputusan;
  }

  public get alasan(): string {
    return this._alasan;
  }

  public get waktu_keputusan(): Date {
    return this._waktu_keputusan;
  }

  public approve(): boolean {
    this._keputusan = 'APPROVED';
    this._waktu_keputusan = new Date();
    return true;
  }

  public reject(alasan?: string): boolean {
    this._keputusan = 'REJECTED';
    if (alasan) this._alasan = alasan;
    this._waktu_keputusan = new Date();
    return true;
  }

  public update(keputusan?: string, alasan?: string): boolean {
    if (keputusan) this._keputusan = keputusan;
    if (alasan !== undefined) this._alasan = alasan;
    this._waktu_keputusan = new Date();
    return true;
  }
}
