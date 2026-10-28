export class Sbpg {
    _id_sbpg;
    _id_pengajuan;
    _batas_waktu_kirim;
    _waktu_kirim;
    _status_ketepatan_waktu;
    _catatan_peminjam;
    _foto_kerusakan;
    constructor(id_sbpg, id_pengajuan, batas_waktu_kirim, waktu_kirim = new Date(), status_ketepatan_waktu = 'TEPAT_WAKTU', catatan_peminjam = '', foto_kerusakan = '') {
        this._id_sbpg = id_sbpg;
        this._id_pengajuan = id_pengajuan;
        this._batas_waktu_kirim = batas_waktu_kirim;
        this._waktu_kirim = waktu_kirim;
        this._status_ketepatan_waktu = status_ketepatan_waktu;
        this._catatan_peminjam = catatan_peminjam;
        this._foto_kerusakan = foto_kerusakan;
    }
    get id_sbpg() {
        return this._id_sbpg;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get batas_waktu_kirim() {
        return this._batas_waktu_kirim;
    }
    get waktu_kirim() {
        return this._waktu_kirim;
    }
    get status_ketepatan_waktu() {
        return this._status_ketepatan_waktu;
    }
    get catatan_peminjam() {
        return this._catatan_peminjam;
    }
    get foto_kerusakan() {
        return this._foto_kerusakan;
    }
    generate() {
        this._waktu_kirim = new Date();
        this._status_ketepatan_waktu = this._waktu_kirim <= this._batas_waktu_kirim ? 'TEPAT_WAKTU' : 'TERLAMBAT';
        return {
            id_sbpg: this._id_sbpg,
            id_pengajuan: this._id_pengajuan,
            waktu_kirim: this._waktu_kirim,
            status_ketepatan_waktu: this._status_ketepatan_waktu,
        };
    }
    save() {
        return this._id_pengajuan > 0;
    }
    uploadFoto(path) {
        if (path && path.trim().length > 0) {
            this._foto_kerusakan = path;
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=sbpg.entity.js.map