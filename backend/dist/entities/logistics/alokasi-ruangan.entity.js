export class AlokasiRuangan {
    _id_alokasi_ruangan;
    _id_pengajuan;
    _id_ruangan;
    _tanggal_mulai;
    _tanggal_selesai;
    _status_alokasi;
    constructor(id_alokasi_ruangan, id_pengajuan, id_ruangan, tanggal_mulai, tanggal_selesai, status_alokasi = 'ALLOCATED') {
        this._id_alokasi_ruangan = id_alokasi_ruangan;
        this._id_pengajuan = id_pengajuan;
        this._id_ruangan = id_ruangan;
        this._tanggal_mulai = tanggal_mulai;
        this._tanggal_selesai = tanggal_selesai;
        this._status_alokasi = status_alokasi;
    }
    get id_alokasi_ruangan() {
        return this._id_alokasi_ruangan;
    }
    get id_pengajuan() {
        return this._id_pengajuan;
    }
    get id_ruangan() {
        return this._id_ruangan;
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
    update(status) {
        if (status) {
            this._status_alokasi = status;
        }
        return true;
    }
}
//# sourceMappingURL=alokasi-ruangan.entity.js.map