
export class SpesifikasiKebutuhan {
  private _id_fsk: number;
  private _id_user: number;
  private _nama_kegiatan: string;
  private _tanggal_mulai: Date;
  private _tanggal_selesai: Date;
  private _waktu_mulai: string;
  private _waktu_selesai: string;
  private _jumlah_peserta: number;
  private _tujuan_kegiatan: string;
  private _status: string;
  private _created_at: Date;

  constructor(
    id_fsk: number,
    id_user: number,
    nama_kegiatan: string,
    tanggal_mulai: Date,
    tanggal_selesai: Date,
    waktu_mulai: string,
    waktu_selesai: string,
    jumlah_peserta: number,
    tujuan_kegiatan: string,
    status: string = 'DRAFT',
    created_at: Date = new Date(),
  ) {
    this._id_fsk = id_fsk;
    this._id_user = id_user;
    this._nama_kegiatan = nama_kegiatan;
    this._tanggal_mulai = tanggal_mulai;
    this._tanggal_selesai = tanggal_selesai;
    this._waktu_mulai = waktu_mulai;
    this._waktu_selesai = waktu_selesai;
    this._jumlah_peserta = jumlah_peserta;
    this._tujuan_kegiatan = tujuan_kegiatan;
    this._status = status;
    this._created_at = created_at;
  }

  public get id_fsk(): number {
    return this._id_fsk;
  }

  public get id_user(): number {
    return this._id_user;
  }

  public get nama_kegiatan(): string {
    return this._nama_kegiatan;
  }

  public get tanggal_mulai(): Date {
    return this._tanggal_mulai;
  }

  public get tanggal_selesai(): Date {
    return this._tanggal_selesai;
  }

  public get waktu_mulai(): string {
    return this._waktu_mulai;
  }

  public get waktu_selesai(): string {
    return this._waktu_selesai;
  }

  public get jumlah_peserta(): number {
    return this._jumlah_peserta;
  }

  public get tujuan_kegiatan(): string {
    return this._tujuan_kegiatan;
  }

  public get status(): string {
    return this._status;
  }

  public get created_at(): Date {
    return this._created_at;
  }

  public create(data: Record<string, any>): boolean {
    if (data.nama_kegiatan) this._nama_kegiatan = data.nama_kegiatan;
    if (data.jumlah_peserta !== undefined) this._jumlah_peserta = data.jumlah_peserta;
    if (data.tujuan_kegiatan) this._tujuan_kegiatan = data.tujuan_kegiatan;
    this._status = 'CREATED';
    return true;
  }

  public update(id: number, data: Record<string, any>): boolean {
    if (this._id_fsk === id) {
      if (data.nama_kegiatan) this._nama_kegiatan = data.nama_kegiatan;
      if (data.jumlah_peserta !== undefined) this._jumlah_peserta = data.jumlah_peserta;
      if (data.tujuan_kegiatan) this._tujuan_kegiatan = data.tujuan_kegiatan;
      if (data.status) this._status = data.status;
      return true;
    }
    return false;
  }

  public validate(): boolean {
    return Boolean(
      this._nama_kegiatan &&
      this._jumlah_peserta > 0 &&
      this._tanggal_mulai &&
      this._tanggal_selesai &&
      this._waktu_mulai &&
      this._waktu_selesai,
    );
  }

  public viewDetail(id: number): object {
    if (this._id_fsk === id) {
      return {
        id_fsk: this._id_fsk,
        id_user: this._id_user,
        nama_kegiatan: this._nama_kegiatan,
        tanggal_mulai: this._tanggal_mulai,
        tanggal_selesai: this._tanggal_selesai,
        waktu_mulai: this._waktu_mulai,
        waktu_selesai: this._waktu_selesai,
        jumlah_peserta: this._jumlah_peserta,
        tujuan_kegiatan: this._tujuan_kegiatan,
        status: this._status,
        created_at: this._created_at,
      };
    }
    return {};
  }
}
