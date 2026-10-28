export class SpesifikasiKebutuhan {
    _id_fsk;
    _id_user;
    _nama_kegiatan;
    _tanggal_mulai;
    _tanggal_selesai;
    _waktu_mulai;
    _waktu_selesai;
    _jumlah_peserta;
    _tujuan_kegiatan;
    _status;
    _created_at;
    constructor(id_fsk, id_user, nama_kegiatan, tanggal_mulai, tanggal_selesai, waktu_mulai, waktu_selesai, jumlah_peserta, tujuan_kegiatan, status = 'DRAFT', created_at = new Date()) {
        this._id_fsk = id_fsk;
        this._id_user = id_user;
        this._nama_kegiatan = nama_kegiatan;
        this._tanggal_mulai = tanggal_mulai;
        this._tanggal_selesai = tanggal_selesai;
        this._waktu_mulai = waktu_mulai;
        this._waktu_selesai = waktu_selesai;
        this._jumlah_peserta = jumlah_peserta;
        this._tujuan_kegiatan = tujuan_kegiatan;
        this._status = status;
        this._created_at = created_at;
    }
    get id_fsk() {
        return this._id_fsk;
    }
    get id_user() {
        return this._id_user;
    }
    get nama_kegiatan() {
        return this._nama_kegiatan;
    }
    get tanggal_mulai() {
        return this._tanggal_mulai;
    }
    get tanggal_selesai() {
        return this._tanggal_selesai;
    }
    get waktu_mulai() {
        return this._waktu_mulai;
    }
    get waktu_selesai() {
        return this._waktu_selesai;
    }
    get jumlah_peserta() {
        return this._jumlah_peserta;
    }
    get tujuan_kegiatan() {
        return this._tujuan_kegiatan;
    }
    get status() {
        return this._status;
    }
    get created_at() {
        return this._created_at;
    }
    create(data) {
        if (data.nama_kegiatan)
            this._nama_kegiatan = data.nama_kegiatan;
        if (data.jumlah_peserta !== undefined)
            this._jumlah_peserta = data.jumlah_peserta;
        if (data.tujuan_kegiatan)
            this._tujuan_kegiatan = data.tujuan_kegiatan;
        this._status = 'CREATED';
        return true;
    }
    update(id, data) {
        if (this._id_fsk === id) {
            if (data.nama_kegiatan)
                this._nama_kegiatan = data.nama_kegiatan;
            if (data.jumlah_peserta !== undefined)
                this._jumlah_peserta = data.jumlah_peserta;
            if (data.tujuan_kegiatan)
                this._tujuan_kegiatan = data.tujuan_kegiatan;
            if (data.status)
                this._status = data.status;
            return true;
        }
        return false;
    }
    validate() {
        return Boolean(this._nama_kegiatan &&
            this._jumlah_peserta > 0 &&
            this._tanggal_mulai &&
            this._tanggal_selesai &&
            this._waktu_mulai &&
            this._waktu_selesai);
    }
    viewDetail(id) {
        if (this._id_fsk === id) {
            return {
                id_fsk: this._id_fsk,
                id_user: this._id_user,
                nama_kegiatan: this._nama_kegiatan,
                tanggal_mulai: this._tanggal_mulai,
                tanggal_selesai: this._tanggal_selesai,
                waktu_mulai: this._waktu_mulai,
                waktu_selesai: this._waktu_selesai,
                jumlah_peserta: this._jumlah_peserta,
                tujuan_kegiatan: this._tujuan_kegiatan,
                status: this._status,
                created_at: this._created_at,
            };
        }
        return {};
    }
}
//# sourceMappingURL=spesifikasi-kebutuhan.entity.js.map