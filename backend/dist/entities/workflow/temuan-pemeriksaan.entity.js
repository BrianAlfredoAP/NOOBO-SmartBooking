export class TemuanPemeriksaan {
    _id_temuan;
    _id_hasil_pemeriksaan;
    _id_logistik;
    _id_ruangan;
    _jenis_temuan;
    _jumlah;
    _deskripsi;
    _foto_bukti;
    constructor(id_temuan, id_hasil_pemeriksaan, id_logistik, id_ruangan, jenis_temuan, jumlah, deskripsi, foto_bukti = '') {
        this._id_temuan = id_temuan;
        this._id_hasil_pemeriksaan = id_hasil_pemeriksaan;
        this._id_logistik = id_logistik;
        this._id_ruangan = id_ruangan;
        this._jenis_temuan = jenis_temuan;
        this._jumlah = jumlah;
        this._deskripsi = deskripsi;
        this._foto_bukti = foto_bukti;
    }
    get id_temuan() {
        return this._id_temuan;
    }
    get id_hasil_pemeriksaan() {
        return this._id_hasil_pemeriksaan;
    }
    get id_logistik() {
        return this._id_logistik;
    }
    get id_ruangan() {
        return this._id_ruangan;
    }
    get jenis_temuan() {
        return this._jenis_temuan;
    }
    get jumlah() {
        return this._jumlah;
    }
    get deskripsi() {
        return this._deskripsi;
    }
    get foto_bukti() {
        return this._foto_bukti;
    }
    addTemuan() {
        return this._id_hasil_pemeriksaan > 0 && Boolean(this._jenis_temuan);
    }
    updateTemuan(data) {
        if (data) {
            if (data.jenis_temuan)
                this._jenis_temuan = data.jenis_temuan;
            if (data.jumlah !== undefined)
                this._jumlah = data.jumlah;
            if (data.deskripsi !== undefined)
                this._deskripsi = data.deskripsi;
            if (data.foto_bukti !== undefined)
                this._foto_bukti = data.foto_bukti;
        }
        return true;
    }
    deleteTemuan() {
        this._jumlah = 0;
        return true;
    }
}
//# sourceMappingURL=temuan-pemeriksaan.entity.js.map