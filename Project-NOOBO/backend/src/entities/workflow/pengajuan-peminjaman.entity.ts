import { PENGAJUAN_STATUS, canTransition, statusLabel } from './pengajuan-status.js';

export class PengajuanPeminjaman {
  private _id_pengajuan: number;
  private _id_fsk: number;
  private _id_paket: number | null;
  private _id_pembina: number | null;
  private _email_pembina: string;
  private _id_aturan: number;
  private _setuju_syarat: boolean;
  private _waktu_setuju: Date | null;
  private _nomor_pengajuan: string;
  private _tanggal_pengajuan: Date;
  private _status: string;
  private _catatan: string;

  constructor(
    id_pengajuan: number,
    id_fsk: number,
    id_paket: number | null,
    id_pembina: number | null,
    email_pembina: string,
    id_aturan: number,
    setuju_syarat: boolean,
    waktu_setuju: Date | null,
    nomor_pengajuan: string,
    tanggal_pengajuan: Date = new Date(),
    status: string = PENGAJUAN_STATUS.SUBMITTED,
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

  public get id_paket(): number | null {
    return this._id_paket;
  }

  public get id_pembina(): number | null {
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

  public get waktu_setuju(): Date | null {
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
    if (
      this._setuju_syarat &&
      this._id_fsk > 0 &&
      (this._status === 'DRAFT' || this._status === PENGAJUAN_STATUS.SUBMITTED)
    ) {
      this._status = PENGAJUAN_STATUS.SUBMITTED;
      this._waktu_setuju ??= new Date();
      return true;
    }
    return false;
  }

  public updateStatus(status: string, catatan?: string): boolean {
    if (!canTransition(this._status, status)) {
      return false;
    }
    this._status = status;
    if (catatan !== undefined) this._catatan = catatan;
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

  public viewDetail(): object {
    return {
      id_pengajuan: this._id_pengajuan,
      id_fsk: this._id_fsk,
      id_paket: this._id_paket,
      id_pembina: this._id_pembina,
      email_pembina: this._email_pembina,
      id_aturan: this._id_aturan,
      setuju_syarat: this._setuju_syarat,
      waktu_setuju: this._waktu_setuju,
      nomor_pengajuan: this._nomor_pengajuan,
      tanggal_pengajuan: this._tanggal_pengajuan,
      status: this._status,
      status_label: statusLabel(this._status),
      catatan: this._catatan,
    };
  }

  static fromRow(row: Record<string, unknown>): PengajuanPeminjaman {
    return new PengajuanPeminjaman(
      Number(row.id_pengajuan),
      Number(row.id_fsk),
      row.id_paket === null || row.id_paket === undefined
        ? null
        : Number(row.id_paket),
      row.id_pembina === null || row.id_pembina === undefined
        ? null
        : Number(row.id_pembina),
      row.email_pembina === null || row.email_pembina === undefined
        ? ''
        : String(row.email_pembina as string | number),
      Number(row.id_aturan),
      Boolean(row.setuju_syarat),
      row.waktu_setuju === null || row.waktu_setuju === undefined
        ? null
        : toDate(row.waktu_setuju),
      String(row.nomor_pengajuan),
      toDate(row.tanggal_pengajuan),
      String(row.status),
      row.catatan === null || row.catatan === undefined
        ? ''
        : String(row.catatan as string | number),
    );
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
