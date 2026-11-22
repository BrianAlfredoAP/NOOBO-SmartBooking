export class Logistik {
    _id_logistik;
    _nama_logistik;
    _jenis;
    _stok_total;
    _kondisi_fasilitas;
    _status_aktif;
    constructor(id_logistik, nama_logistik, jenis, stok_total, kondisi_fasilitas, status_aktif = true) {
        this._id_logistik = id_logistik;
        this._nama_logistik = nama_logistik;
        this._jenis = jenis;
        this._stok_total = stok_total;
        this._kondisi_fasilitas = kondisi_fasilitas;
        this._status_aktif = status_aktif;
    }
    get id_logistik() {
        return this._id_logistik;
    }
    get nama_logistik() {
        return this._nama_logistik;
    }
    get jenis() {
        return this._jenis;
    }
    get stok_total() {
        return this._stok_total;
    }
    get kondisi_fasilitas() {
        return this._kondisi_fasilitas;
    }
    get status_aktif() {
        return this._status_aktif;
    }
    updateStok(qty) {
        if (!Number.isInteger(qty) || qty === 0 || this._stok_total + qty < 0)
            return false;
        this._stok_total += qty;
        return true;
    }
    static fromRow(row) {
        return new Logistik(Number(row.id_logistik), String(row.nama_logistik), String(row.jenis), Number(row.stok_total), String(row.kondisi_fasilitas), Boolean(row.status_aktif));
    }
    viewDetail() {
        return {
            id_logistik: this._id_logistik,
            nama_logistik: this._nama_logistik,
            jenis: this._jenis,
            stok_total: this._stok_total,
            kondisi_fasilitas: this._kondisi_fasilitas,
            status_aktif: this._status_aktif,
        };
    }
}
//# sourceMappingURL=logistik.entity.js.map