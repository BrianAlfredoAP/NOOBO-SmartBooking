/**
 * Sbp (Surat Bukti Peminjaman) Domain Entity
 * Mapped to table: sbp
 */
export class Sbp {
  private _id_sbp: number;
  private _id_pengajuan: number;
  private _id_user_penerbit: number;
  private _nomor_sbp: string;
  private _tanggal_terbit: Date;
  private _lokasi_dokumen: string;

  constructor(
    id_sbp: number,
    id_pengajuan: number,
    id_user_penerbit: number,
    nomor_sbp: string,
    tanggal_terbit: Date = new Date(),
    lokasi_dokumen: string = '',
  ) {
    this._id_sbp = id_sbp;
    this._id_pengajuan = id_pengajuan;
    this._id_user_penerbit = id_user_penerbit;
    this._nomor_sbp = nomor_sbp;
    this._tanggal_terbit = tanggal_terbit;
    this._lokasi_dokumen = lokasi_dokumen;
  }

  // Public getters (+)
  public get id_sbp(): number {
    return this._id_sbp;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get id_user_penerbit(): number {
    return this._id_user_penerbit;
  }

  public get nomor_sbp(): string {
    return this._nomor_sbp;
  }

  public get tanggal_terbit(): Date {
    return this._tanggal_terbit;
  }

  public get lokasi_dokumen(): string {
    return this._lokasi_dokumen;
  }

  public generate(): object {
    this._nomor_sbp = `SBP-${this._id_pengajuan}-${Date.now()}`;
    this._tanggal_terbit = new Date();
    this._lokasi_dokumen = `/documents/sbp/${this._nomor_sbp}.pdf`;
    return {
      id_sbp: this._id_sbp,
      id_pengajuan: this._id_pengajuan,
      nomor_sbp: this._nomor_sbp,
      tanggal_terbit: this._tanggal_terbit,
      lokasi_dokumen: this._lokasi_dokumen,
    };
  }

  public save(): boolean {
    return Boolean(this._nomor_sbp && this._lokasi_dokumen);
  }

  public download(): string {
    return this._lokasi_dokumen;
  }
}
