export class AlokasiLogistik {
    _id_alokasi_logistik;
    _id_pengajuan;
    _id_logistik;
    _jumlah_dialokasikan;
    _tanggal_mulai;
    _tanggal_selesai;
    _status_alokasi;
    constructor(id_alokasi_logistik, id_pengajuan, id_logistik, jumlah_dialokasikan, tanggal_mulai, tanggal_selesai, status_alokasi = 'ALLOCATED') {
        this._id_alokasi_logistik = id_alokasi_logistik;
        this._id_pengajuan = id_pengajuan;
        this._id_logistik = id_logistik;
        this._jumlah_dialokasikan = jumlah_dialokasikan;
        this._tanggal_mulai = tanggal_mulai;
        this._tanggal_selesai = tanggal_selesai;
        this._status_alokasi = status_alokasi;
    }
    get id_alokasi_logistik() {
        return this._id_alokasi_logistik;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_logistik() {
        return this._id_logistik;
    }
    get jumlah_dialokasikan() {
        return this._jumlah_dialokasikan;
    }
    get tanggal_mulai() {
        return this._tanggal_mulai;
    }
    get tanggal_selesai() {
        return this._tanggal_selesai;
    }
    get status_alokasi() {
        return this._status_alokasi;
    }
    allocate() {
        this._status_alokasi = 'ALLOCATED';
        return true;
    }
    release() {
        this._status_alokasi = 'RELEASED';
        return true;
    }
    update(jumlah, status) {
        if (jumlah !== undefined)
            this._jumlah_dialokasikan = jumlah;
        if (status)
            this._status_alokasi = status;
        return true;
    }
}
//# sourceMappingURL=alokasi-logistik.entity.js.map