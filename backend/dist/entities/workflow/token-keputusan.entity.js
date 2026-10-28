export class TokenKeputusan {
    _id_notifikasi;
    _id_pengajuan;
    _id_token;
    _dibuat_pada;
    _kedaluwarsa_pada;
    _waktu_digunakan;
    _status;
    _token_value;
    constructor(id_notifikasi, id_pengajuan, id_token, dibuat_pada = new Date(), kedaluwarsa_pada = new Date(Date.now() + 48 * 60 * 60 * 1000), waktu_digunakan = null, status = 'UNUSED', token_value = '') {
        this._id_notifikasi = id_notifikasi;
        this._id_pengajuan = id_pengajuan;
        this._id_token = id_token;
        this._dibuat_pada = dibuat_pada;
        this._kedaluwarsa_pada = kedaluwarsa_pada;
        this._waktu_digunakan = waktu_digunakan;
        this._status = status;
        this._token_value = token_value || `token_decision_${id_pengajuan}_${Date.now()}`;
    }
    get id_notifikasi() {
        return this._id_notifikasi;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_token() {
        return this._id_token;
    }
    get dibuat_pada() {
        return this._dibuat_pada;
    }
    get kedaluwarsa_pada() {
        return this._kedaluwarsa_pada;
    }
    get waktu_digunakan() {
        return this._waktu_digunakan;
    }
    get status() {
        return this._status;
    }
    generateToken() {
        this._token_value = `token_dec_${this._id_pengajuan}_${Date.now()}`;
        this._status = 'ACTIVE';
        return this._token_value;
    }
    validateToken() {
        const isNotExpired = new Date() < this._kedaluwarsa_pada;
        const isUnused = this._status !== 'USED';
        return isNotExpired && isUnused;
    }
    markAsUsed() {
        this._waktu_digunakan = new Date();
        this._status = 'USED';
        return true;
    }
}
//# sourceMappingURL=token-keputusan.entity.js.map