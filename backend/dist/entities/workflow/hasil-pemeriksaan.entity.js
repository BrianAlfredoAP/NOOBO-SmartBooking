export class HasilPemeriksaan {
    _id_hasil_pemeriksaan;
    _id_pengajuan;
    _id_sbpg;
    _id_user_pemeriksa;
    _waktu_pemeriksaan;
    _status_pemeriksaan;
    _catatan;
    constructor(id_hasil_pemeriksaan, id_pengajuan, id_sbpg, id_user_pemeriksa, waktu_pemeriksaan = new Date(), status_pemeriksaan = 'IN_PROGRESS', catatan = '') {
        this._id_hasil_pemeriksaan = id_hasil_pemeriksaan;
        this._id_pengajuan = id_pengajuan;
        this._id_sbpg = id_sbpg;
        this._id_user_pemeriksa = id_user_pemeriksa;
        this._waktu_pemeriksaan = waktu_pemeriksaan;
        this._status_pemeriksaan = status_pemeriksaan;
        this._catatan = catatan;
    }
    get id_hasil_pemeriksaan() {
        return this._id_hasil_pemeriksaan;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_sbpg() {
        return this._id_sbpg;
    }
    get id_user_pemeriksa() {
        return this._id_user_pemeriksa;
    }
    get waktu_pemeriksaan() {
        return this._waktu_pemeriksaan;
    }
    get status_pemeriksaan() {
        return this._status_pemeriksaan;
    }
    get catatan() {
        return this._catatan;
    }
    inspect() {
        this._status_pemeriksaan = 'IN_PROGRESS';
        this._waktu_pemeriksaan = new Date();
        return true;
    }
    updateStatus(status) {
        if (status) {
            this._status_pemeriksaan = status;
        }
        return true;
    }
    complete() {
        this._status_pemeriksaan = 'COMPLETED';
        this._waktu_pemeriksaan = new Date();
        return true;
    }
}
//# sourceMappingURL=hasil-pemeriksaan.entity.js.map