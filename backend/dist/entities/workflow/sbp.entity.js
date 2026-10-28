export class Sbp {
    _id_sbp;
    _id_pengajuan;
    _id_user_penerbit;
    _nomor_sbp;
    _tanggal_terbit;
    _lokasi_dokumen;
    constructor(id_sbp, id_pengajuan, id_user_penerbit, nomor_sbp, tanggal_terbit = new Date(), lokasi_dokumen = '') {
        this._id_sbp = id_sbp;
        this._id_pengajuan = id_pengajuan;
        this._id_user_penerbit = id_user_penerbit;
        this._nomor_sbp = nomor_sbp;
        this._tanggal_terbit = tanggal_terbit;
        this._lokasi_dokumen = lokasi_dokumen;
    }
    get id_sbp() {
        return this._id_sbp;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_user_penerbit() {
        return this._id_user_penerbit;
    }
    get nomor_sbp() {
        return this._nomor_sbp;
    }
    get tanggal_terbit() {
        return this._tanggal_terbit;
    }
    get lokasi_dokumen() {
        return this._lokasi_dokumen;
    }
    generate() {
        this._nomor_sbp = `SBP-${this._id_pengajuan}-${Date.now()}`;
        this._tanggal_terbit = new Date();
        this._lokasi_dokumen = `/documents/sbp/${this._nomor_sbp}.pdf`;
        return {
            id_sbp: this._id_sbp,
            id_pengajuan: this._id_pengajuan,
            nomor_sbp: this._nomor_sbp,
            tanggal_terbit: this._tanggal_terbit,
            lokasi_dokumen: this._lokasi_dokumen,
        };
    }
    save() {
        return Boolean(this._nomor_sbp && this._lokasi_dokumen);
    }
    download() {
        return this._lokasi_dokumen;
    }
}
//# sourceMappingURL=sbp.entity.js.map