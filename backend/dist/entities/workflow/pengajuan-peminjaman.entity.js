export class PengajuanPeminjaman {
    _id_pengajuan;
    _id_fsk;
    _id_paket;
    _id_pembina;
    _email_pembina;
    _id_aturan;
    _setuju_syarat;
    _waktu_setuju;
    _nomor_pengajuan;
    _tanggal_pengajuan;
    _status;
    _catatan;
    constructor(id_pengajuan, id_fsk, id_paket, id_pembina, email_pembina, id_aturan, setuju_syarat, waktu_setuju, nomor_pengajuan, tanggal_pengajuan = new Date(), status = 'DRAFT', catatan = '') {
        this._id_pengajuan = id_pengajuan;
        this._id_fsk = id_fsk;
        this._id_paket = id_paket;
        this._id_pembina = id_pembina;
        this._email_pembina = email_pembina;
        this._id_aturan = id_aturan;
        this._setuju_syarat = setuju_syarat;
        this._waktu_setuju = waktu_setuju;
        this._nomor_pengajuan = nomor_pengajuan;
        this._tanggal_pengajuan = tanggal_pengajuan;
        this._status = status;
        this._catatan = catatan;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_fsk() {
        return this._id_fsk;
    }
    get id_paket() {
        return this._id_paket;
    }
    get id_pembina() {
        return this._id_pembina;
    }
    get email_pembina() {
        return this._email_pembina;
    }
    get id_aturan() {
        return this._id_aturan;
    }
    get setuju_syarat() {
        return this._setuju_syarat;
    }
    get waktu_setuju() {
        return this._waktu_setuju;
    }
    get nomor_pengajuan() {
        return this._nomor_pengajuan;
    }
    get tanggal_pengajuan() {
        return this._tanggal_pengajuan;
    }
    get status() {
        return this._status;
    }
    get catatan() {
        return this._catatan;
    }
    submit() {
        if (this._setuju_syarat && this._id_fsk > 0) {
            this._status = 'MENUNGGU_PERSETUJUAN_PEMBINA';
            return true;
        }
        return false;
    }
    updateStatus(status) {
        this._status = status;
        return true;
    }
    viewHistory() {
        return [
            {
                nomor_pengajuan: this._nomor_pengajuan,
                tanggal_pengajuan: this._tanggal_pengajuan,
                status: this._status,
                catatan: this._catatan,
            },
        ];
    }
}
//# sourceMappingURL=pengajuan-peminjaman.entity.js.map