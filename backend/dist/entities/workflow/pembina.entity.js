export class Pembina {
    _id_pembina;
    _nama_pembina;
    _email_pembina;
    _status_aktif;
    constructor(id_pembina, nama_pembina, email_pembina, status_aktif = true) {
        this._id_pembina = id_pembina;
        this._nama_pembina = nama_pembina;
        this._email_pembina = email_pembina;
        this._status_aktif = status_aktif;
    }
    get id_pembina() {
        return this._id_pembina;
    }
    get nama_pembina() {
        return this._nama_pembina;
    }
    get email_pembina() {
        return this._email_pembina;
    }
    get status_aktif() {
        return this._status_aktif;
    }
    approve(idPengajuan) {
        return this._status_aktif && idPengajuan > 0;
    }
    reject(idPengajuan) {
        return this._status_aktif && idPengajuan > 0;
    }
    viewPengajuan() {
        return [
            {
                pembinaId: this._id_pembina,
                nama: this._nama_pembina,
                email: this._email_pembina,
                status: this._status_aktif,
            },
        ];
    }
}
//# sourceMappingURL=pembina.entity.js.map