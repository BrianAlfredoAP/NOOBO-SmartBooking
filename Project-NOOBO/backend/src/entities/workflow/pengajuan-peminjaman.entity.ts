export class PengajuanPeminjaman {
  private _id_pengajuan: number;
  private _id_fsk: number;
  private _id_paket: number;
  private _id_pembina: number;
  private _email_pembina: string;
  private _id_aturan: number;
  private _setuju_syarat: boolean;
  private _waktu_setuju: Date;
  private _nomor_pengajuan: string;
  private _tanggal_pengajuan: Date;
  private _status: string;
  private _catatan: string;

  constructor(
    id_pengajuan: number,
    id_fsk: number,
    id_paket: number,
    id_pembina: number,
    email_pembina: string,
    id_aturan: number,
    setuju_syarat: boolean,
    waktu_setuju: Date,
    nomor_pengajuan: string,
    tanggal_pengajuan: Date = new Date(),
    status: string = 'DRAFT',
    catatan: string = '',
  ) {
    this._id_pengajuan = id_pengajuan;
    this._id_fsk = id_fsk;
    this._id_paket = id_paket;
    this._id_pembina = id_pembina;
    this._email_pembina = email_pembina;
    this._id_aturan = id_aturan;
    this._setuju_syarat = setuju_syarat;
    this._waktu_setuju = waktu_setuju;
    this._nomor_pengajuan = nomor_pengajuan;
    this._tanggal_pengajuan = tanggal_pengajuan;
    this._status = status;
    this._catatan = catatan;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_fsk(): number {
    return this._id_fsk;
  }

  public get id_paket(): number {
    return this._id_paket;
  }

  public get id_pembina(): number {
    return this._id_pembina;
  }

  public get email_pembina(): string {
    return this._email_pembina;
  }

  public get id_aturan(): number {
    return this._id_aturan;
  }

  public get setuju_syarat(): boolean {
    return this._setuju_syarat;
  }

  public get waktu_setuju(): Date {
    return this._waktu_setuju;
  }

  public get nomor_pengajuan(): string {
    return this._nomor_pengajuan;
  }

  public get tanggal_pengajuan(): Date {
    return this._tanggal_pengajuan;
  }

  public get status(): string {
    return this._status;
  }

  public get catatan(): string {
    return this._catatan;
  }

  public submit(): boolean {
    if (this._setuju_syarat && this._id_fsk > 0) {
      this._status = 'MENUNGGU_PERSETUJUAN_PEMBINA';
      return true;
    }
    return false;
  }

  public updateStatus(status: string): boolean {
    this._status = status;
    return true;
  }

  public viewHistory(): Array<object> {
    return [
      {
        nomor_pengajuan: this._nomor_pengajuan,
        tanggal_pengajuan: this._tanggal_pengajuan,
        status: this._status,
        catatan: this._catatan,
      },
    ];
  }
}
