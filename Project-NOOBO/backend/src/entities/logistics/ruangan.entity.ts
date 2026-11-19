export class Ruangan {
  private _id_ruangan: number;
  private _nama_ruangan: string;
  private _jenis: string;
  private _lokasi: string;
  private _kapasitas: number;
  private _kondisi_fasilitas: string;
  private _status_aktif: boolean;

  constructor(
    id_ruangan: number,
    nama_ruangan: string,
    jenis: string,
    lokasi: string,
    kapasitas: number,
    kondisi_fasilitas: string,
    status_aktif: boolean = true,
  ) {
    this._id_ruangan = id_ruangan;
    this._nama_ruangan = nama_ruangan;
    this._jenis = jenis;
    this._lokasi = lokasi;
    this._kapasitas = kapasitas;
    this._kondisi_fasilitas = kondisi_fasilitas;
    this._status_aktif = status_aktif;
  }

  public get id_ruangan(): number {
    return this._id_ruangan;
  }

  public get nama_ruangan(): string {
    return this._nama_ruangan;
  }

  public get jenis(): string {
    return this._jenis;
  }

  public get lokasi(): string {
    return this._lokasi;
  }

  public get kapasitas(): number {
    return this._kapasitas;
  }

  public get kondisi_fasilitas(): string {
    return this._kondisi_fasilitas;
  }

  public get status_aktif(): boolean {
    return this._status_aktif;
  }

  public updateStatus(status: boolean): boolean {
    this._status_aktif = status;
    return true;
  }

  public viewDetail(): object {
    return {
      id_ruangan: this._id_ruangan,
      nama_ruangan: this._nama_ruangan,
      jenis: this._jenis,
      lokasi: this._lokasi,
      kapasitas: this._kapasitas,
      kondisi_fasilitas: this._kondisi_fasilitas,
      status_aktif: this._status_aktif,
    };
  }
}
