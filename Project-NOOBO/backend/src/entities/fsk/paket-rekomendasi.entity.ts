export class PaketRekomendasi {
  private _id_paket: number;
  private _id_fsk: number;
  private _nama_paket: string;
  private _skor: number;
  private _alasan: string;
  private _dipilih: boolean;
  private _dibuat_pada: Date;

  constructor(
    id_paket: number,
    id_fsk: number,
    nama_paket: string,
    skor: number,
    alasan: string,
    dipilih: boolean = false,
    dibuat_pada: Date = new Date(),
  ) {
    this._id_paket = id_paket;
    this._id_fsk = id_fsk;
    this._nama_paket = nama_paket;
    this._skor = skor;
    this._alasan = alasan;
    this._dipilih = dipilih;
    this._dibuat_pada = dibuat_pada;
  }

  public get id_paket(): number {
    return this._id_paket;
  }

  public get id_fsk(): number {
    return this._id_fsk;
  }

  public get nama_paket(): string {
    return this._nama_paket;
  }

  public get skor(): number {
    return this._skor;
  }

  public get alasan(): string {
    return this._alasan;
  }

  public get dipilih(): boolean {
    return this._dipilih;
  }

  public get dibuat_pada(): Date {
    return this._dibuat_pada;
  }

  public generate(fskId: number): object {
    this._id_fsk = fskId;
    this._nama_paket = `Paket Rekomendasi FSK #${fskId}`;
    this._skor = 95.5;
    this._alasan = 'Sesuai dengan kapasitas dan ketersediaan ruangan serta logistik';
    this._dibuat_pada = new Date();
    return {
      id_paket: this._id_paket,
      id_fsk: this._id_fsk,
      nama_paket: this._nama_paket,
      skor: this._skor,
      alasan: this._alasan,
    };
  }

  public select(): boolean {
    this._dipilih = true;
    return true;
  }

  public update(data?: Partial<{ nama_paket: string; skor: number; alasan: string }>): boolean {
    if (data) {
      if (data.nama_paket) this._nama_paket = data.nama_paket;
      if (data.skor !== undefined) this._skor = data.skor;
      if (data.alasan) this._alasan = data.alasan;
    }
    return true;
  }

  public delete(): boolean {
    this._dipilih = false;
    return true;
  }
}
