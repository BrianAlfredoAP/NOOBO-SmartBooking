export class Ruangan {
    _id_ruangan;
    _nama_ruangan;
    _jenis;
    _lokasi;
    _kapasitas;
    _kondisi_fasilitas;
    _status_aktif;
    constructor(id_ruangan, nama_ruangan, jenis, lokasi, kapasitas, kondisi_fasilitas, status_aktif = true) {
        this._id_ruangan = id_ruangan;
        this._nama_ruangan = nama_ruangan;
        this._jenis = jenis;
        this._lokasi = lokasi;
        this._kapasitas = kapasitas;
        this._kondisi_fasilitas = kondisi_fasilitas;
        this._status_aktif = status_aktif;
    }
    get id_ruangan() {
        return this._id_ruangan;
    }
    get nama_ruangan() {
        return this._nama_ruangan;
    }
    get jenis() {
        return this._jenis;
    }
    get lokasi() {
        return this._lokasi;
    }
    get kapasitas() {
        return this._kapasitas;
    }
    get kondisi_fasilitas() {
        return this._kondisi_fasilitas;
    }
    get status_aktif() {
        return this._status_aktif;
    }
    updateStatus(status) {
        this._status_aktif = status;
        return true;
    }
    viewDetail() {
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
//# sourceMappingURL=ruangan.entity.js.map