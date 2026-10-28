export class KeputusanLogistik {
    _id_keputusan_logistik;
    _id_pengajuan;
    _id_user_logistik;
    _keputusan;
    _alasan;
    _waktu_keputusan;
    constructor(id_keputusan_logistik, id_pengajuan, id_user_logistik, keputusan = 'PENDING', alasan = '', waktu_keputusan = new Date()) {
        this._id_keputusan_logistik = id_keputusan_logistik;
        this._id_pengajuan = id_pengajuan;
        this._id_user_logistik = id_user_logistik;
        this._keputusan = keputusan;
        this._alasan = alasan;
        this._waktu_keputusan = waktu_keputusan;
    }
    get id_keputusan_logistik() {
        return this._id_keputusan_logistik;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_user_logistik() {
        return this._id_user_logistik;
    }
    get keputusan() {
        return this._keputusan;
    }
    get alasan() {
        return this._alasan;
    }
    get waktu_keputusan() {
        return this._waktu_keputusan;
    }
    approve() {
        this._keputusan = 'APPROVED';
        this._waktu_keputusan = new Date();
        return true;
    }
    reject(alasan) {
        this._keputusan = 'REJECTED';
        if (alasan)
            this._alasan = alasan;
        this._waktu_keputusan = new Date();
        return true;
    }
    update(keputusan, alasan) {
        if (keputusan)
            this._keputusan = keputusan;
        if (alasan !== undefined)
            this._alasan = alasan;
        this._waktu_keputusan = new Date();
        return true;
    }
}
//# sourceMappingURL=keputusan-logistik.entity.js.map