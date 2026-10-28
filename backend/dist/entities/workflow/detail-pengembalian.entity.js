export class DetailPengembalian {
    _id_detail_pengembalian;
    _id_sbpg;
    _id_alokasi_ruangan;
    _id_alokasi_logistik;
    _jumlah_dikembalikan;
    _kondisi_kembali;
    _catatan;
    constructor(id_detail_pengembalian, id_sbpg, id_alokasi_ruangan, id_alokasi_logistik, jumlah_dikembalikan, kondisi_kembali, catatan = '') {
        this._id_detail_pengembalian = id_detail_pengembalian;
        this._id_sbpg = id_sbpg;
        this._id_alokasi_ruangan = id_alokasi_ruangan;
        this._id_alokasi_logistik = id_alokasi_logistik;
        this._jumlah_dikembalikan = jumlah_dikembalikan;
        this._kondisi_kembali = kondisi_kembali;
        this._catatan = catatan;
    }
    get id_detail_pengembalian() {
        return this._id_detail_pengembalian;
    }
    get id_sbpg() {
        return this._id_sbpg;
    }
    get id_alokasi_ruangan() {
        return this._id_alokasi_ruangan;
    }
    get id_alokasi_logistik() {
        return this._id_alokasi_logistik;
    }
    get jumlah_dikembalikan() {
        return this._jumlah_dikembalikan;
    }
    get kondisi_kembali() {
        return this._kondisi_kembali;
    }
    get catatan() {
        return this._catatan;
    }
    addDetail() {
        return this._id_sbpg > 0 && this._jumlah_dikembalikan >= 0;
    }
    updateDetail(data) {
        if (data) {
            if (data.jumlah_dikembalikan !== undefined)
                this._jumlah_dikembalikan = data.jumlah_dikembalikan;
            if (data.kondisi_kembali)
                this._kondisi_kembali = data.kondisi_kembali;
            if (data.catatan !== undefined)
                this._catatan = data.catatan;
        }
        return true;
    }
    validate() {
        return Boolean(this._id_sbpg > 0 && this._kondisi_kembali);
    }
}
//# sourceMappingURL=detail-pengembalian.entity.js.map