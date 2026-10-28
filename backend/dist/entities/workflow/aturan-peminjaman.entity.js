export class AturanPeminjaman {
    _id_aturan;
    _nama_aturan;
    _deskripsi;
    _ketentuan;
    _aktif;
    constructor(id_aturan, nama_aturan, deskripsi, ketentuan, aktif = true) {
        this._id_aturan = id_aturan;
        this._nama_aturan = nama_aturan;
        this._deskripsi = deskripsi;
        this._ketentuan = ketentuan;
        this._aktif = aktif;
    }
    get id_aturan() {
        return this._id_aturan;
    }
    get nama_aturan() {
        return this._nama_aturan;
    }
    get deskripsi() {
        return this._deskripsi;
    }
    get ketentuan() {
        return this._ketentuan;
    }
    get aktif() {
        return this._aktif;
    }
    create() {
        return Boolean(this._nama_aturan && this._ketentuan);
    }
    update(data) {
        if (data) {
            if (data.nama_aturan)
                this._nama_aturan = data.nama_aturan;
            if (data.deskripsi !== undefined)
                this._deskripsi = data.deskripsi;
            if (data.ketentuan)
                this._ketentuan = data.ketentuan;
            if (data.aktif !== undefined)
                this._aktif = data.aktif;
        }
        return true;
    }
    delete() {
        this._aktif = false;
        return true;
    }
}
//# sourceMappingURL=aturan-peminjaman.entity.js.map