export class Notifikasi {
  private _id_notifikasi: number;
  private _id_user: number;
  private _id_pengajuan: number | null;
  private _judul: string;
  private _isi: string;
  private _kategori: string;
  private _sudah_dibaca: boolean;
  private _dibuat_pada: Date;

  constructor(
    id_notifikasi: number,
    id_user: number,
    id_pengajuan: number | null,
    judul: string,
    isi: string,
    kategori: string = 'Pengajuan',
    sudah_dibaca: boolean = false,
    dibuat_pada: Date = new Date(),
  ) {
    this._id_notifikasi = id_notifikasi;
    this._id_user = id_user;
    this._id_pengajuan = id_pengajuan;
    this._judul = judul;
    this._isi = isi;
    this._kategori = kategori;
    this._sudah_dibaca = sudah_dibaca;
    this._dibuat_pada = dibuat_pada;
  }

  public get id_notifikasi(): number {
    return this._id_notifikasi;
  }

  public get id_user(): number {
    return this._id_user;
  }

  public get id_pengajuan(): number | null {
    return this._id_pengajuan;
  }

  public get judul(): string {
    return this._judul;
  }

  public get isi(): string {
    return this._isi;
  }

  public get kategori(): string {
    return this._kategori;
  }

  public get sudah_dibaca(): boolean {
    return this._sudah_dibaca;
  }

  public get dibuat_pada(): Date {
    return this._dibuat_pada;
  }

  public markAsRead(): boolean {
    this._sudah_dibaca = true;
    return true;
  }

  /** Bentuk yang dipakai langsung oleh model notifikasi frontend. */
  public viewDetail(): object {
    return {
      id: `n-${this._id_notifikasi}`,
      id_notifikasi: this._id_notifikasi,
      title: this._judul,
      body: this._isi,
      category: this._kategori,
      requestId: this._id_pengajuan,
      read: this._sudah_dibaca,
      date: this._dibuat_pada,
    };
  }

  static fromRow(row: Record<string, unknown>): Notifikasi {
    return new Notifikasi(
      Number(row.id_notifikasi),
      Number(row.id_user),
      row.id_pengajuan == null ? null : Number(row.id_pengajuan),
      String(row.judul),
      String(row.isi),
      row.kategori == null ? 'Pengajuan' : String(row.kategori as string | number),
      Boolean(row.sudah_dibaca),
      row.dibuat_pada instanceof Date ? row.dibuat_pada : new Date(String(row.dibuat_pada)),
    );
  }
}
