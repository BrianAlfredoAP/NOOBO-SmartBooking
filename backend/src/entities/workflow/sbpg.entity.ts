export class Sbpg {
  private _id_sbpg: number;
  private _id_pengajuan: number;
  private _batas_waktu_kirim: Date;
  private _waktu_kirim: Date;
  private _status_ketepatan_waktu: string;
  private _catatan_peminjam: string;
  private _foto_kerusakan: string;

  constructor(
    id_sbpg: number,
    id_pengajuan: number,
    batas_waktu_kirim: Date,
    waktu_kirim: Date = new Date(),
    status_ketepatan_waktu: string = 'TEPAT_WAKTU',
    catatan_peminjam: string = '',
    foto_kerusakan: string = '',
  ) {
    this._id_sbpg = id_sbpg;
    this._id_pengajuan = id_pengajuan;
    this._batas_waktu_kirim = batas_waktu_kirim;
    this._waktu_kirim = waktu_kirim;
    this._status_ketepatan_waktu = status_ketepatan_waktu;
    this._catatan_peminjam = catatan_peminjam;
    this._foto_kerusakan = foto_kerusakan;
  }

  public get id_sbpg(): number {
    return this._id_sbpg;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get batas_waktu_kirim(): Date {
    return this._batas_waktu_kirim;
  }

  public get waktu_kirim(): Date {
    return this._waktu_kirim;
  }

  public get status_ketepatan_waktu(): string {
    return this._status_ketepatan_waktu;
  }

  public get catatan_peminjam(): string {
    return this._catatan_peminjam;
  }

  public get foto_kerusakan(): string {
    return this._foto_kerusakan;
  }

  public generate(): object {
    this._waktu_kirim = new Date();
    this._status_ketepatan_waktu = this._waktu_kirim <= this._batas_waktu_kirim ? 'TEPAT_WAKTU' : 'TERLAMBAT';
    return {
      id_sbpg: this._id_sbpg,
      id_pengajuan: this._id_pengajuan,
      waktu_kirim: this._waktu_kirim,
      status_ketepatan_waktu: this._status_ketepatan_waktu,
    };
  }

  public save(): boolean {
    return this._id_pengajuan > 0;
  }

  public uploadFoto(path: string): boolean {
    if (path && path.trim().length > 0) {
      this._foto_kerusakan = path;
      return true;
    }
    return false;
  }
}
