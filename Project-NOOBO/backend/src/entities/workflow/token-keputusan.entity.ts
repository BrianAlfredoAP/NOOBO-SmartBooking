export class TokenKeputusan {
  private _id_notifikasi: number;
  private _id_pengajuan: number;
  private _id_token: number;
  private _dibuat_pada: Date;
  private _kedaluwarsa_pada: Date;
  private _waktu_digunakan: Date | null;
  private _status: string;
  private _token_value: string;

  constructor(
    id_notifikasi: number,
    id_pengajuan: number,
    id_token: number,
    dibuat_pada: Date = new Date(),
    kedaluwarsa_pada: Date = new Date(Date.now() + 48 * 60 * 60 * 1000),
    waktu_digunakan: Date | null = null,
    status: string = 'UNUSED',
    token_value: string = '',
  ) {
    this._id_notifikasi = id_notifikasi;
    this._id_pengajuan = id_pengajuan;
    this._id_token = id_token;
    this._dibuat_pada = dibuat_pada;
    this._kedaluwarsa_pada = kedaluwarsa_pada;
    this._waktu_digunakan = waktu_digunakan;
    this._status = status;
    this._token_value = token_value || `token_decision_${id_pengajuan}_${Date.now()}`;
  }

  public get id_notifikasi(): number {
    return this._id_notifikasi;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_token(): number {
    return this._id_token;
  }

  public get dibuat_pada(): Date {
    return this._dibuat_pada;
  }

  public get kedaluwarsa_pada(): Date {
    return this._kedaluwarsa_pada;
  }

  public get waktu_digunakan(): Date | null {
    return this._waktu_digunakan;
  }

  public get status(): string {
    return this._status;
  }

  public generateToken(): string {
    this._token_value = `token_dec_${this._id_pengajuan}_${Date.now()}`;
    this._status = 'ACTIVE';
    return this._token_value;
  }

  public validateToken(): boolean {
    const isNotExpired = new Date() < this._kedaluwarsa_pada;
    const isUnused = this._status !== 'USED';
    return isNotExpired && isUnused;
  }

  public markAsUsed(): boolean {
    this._waktu_digunakan = new Date();
    this._status = 'USED';
    return true;
  }
}
