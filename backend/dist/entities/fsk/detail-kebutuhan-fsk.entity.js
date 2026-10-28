export class DetailKebutuhanFsk {
    _id_detail_kebutuhan;
    _id_fsk;
    _kategori;
    _jenis_kebutuhan;
    _jumlah;
    _keterangan;
    constructor(id_detail_kebutuhan, id_fsk, kategori, jenis_kebutuhan, jumlah, keterangan) {
        this._id_detail_kebutuhan = id_detail_kebutuhan;
        this._id_fsk = id_fsk;
        this._kategori = kategori;
        this._jenis_kebutuhan = jenis_kebutuhan;
        this._jumlah = jumlah;
        this._keterangan = keterangan;
    }
    get id_detail_kebutuhan() {
        return this._id_detail_kebutuhan;
    }
    get id_fsk() {
        return this._id_fsk;
    }
    get kategori() {
        return this._kategori;
    }
    get jenis_kebutuhan() {
        return this._jenis_kebutuhan;
    }
    get jumlah() {
        return this._jumlah;
    }
    get keterangan() {
        return this._keterangan;
    }
    addDetail() {
        return this._id_fsk > 0 && this._jumlah > 0;
    }
    updateDetail(data) {
        if (data) {
            if (data.kategori)
                this._kategori = data.kategori;
            if (data.jenis_kebutuhan)
                this._jenis_kebutuhan = data.jenis_kebutuhan;
            if (data.jumlah !== undefined)
                this._jumlah = data.jumlah;
            if (data.keterangan !== undefined)
                this._keterangan = data.keterangan;
        }
        return true;
    }
    deleteDetail() {
        this._jumlah = 0;
        return true;
    }
}
//# sourceMappingURL=detail-kebutuhan-fsk.entity.js.map