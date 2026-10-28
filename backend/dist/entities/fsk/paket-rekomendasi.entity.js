export class PaketRekomendasi {
    _id_paket;
    _id_fsk;
    _nama_paket;
    _skor;
    _alasan;
    _dipilih;
    _dibuat_pada;
    constructor(id_paket, id_fsk, nama_paket, skor, alasan, dipilih = false, dibuat_pada = new Date()) {
        this._id_paket = id_paket;
        this._id_fsk = id_fsk;
        this._nama_paket = nama_paket;
        this._skor = skor;
        this._alasan = alasan;
        this._dipilih = dipilih;
        this._dibuat_pada = dibuat_pada;
    }
    get id_paket() {
        return this._id_paket;
    }
    get id_fsk() {
        return this._id_fsk;
    }
    get nama_paket() {
        return this._nama_paket;
    }
    get skor() {
        return this._skor;
    }
    get alasan() {
        return this._alasan;
    }
    get dipilih() {
        return this._dipilih;
    }
    get dibuat_pada() {
        return this._dibuat_pada;
    }
    generate(fskId) {
        this._id_fsk = fskId;
        this._nama_paket = `Paket Rekomendasi FSK #${fskId}`;
        this._skor = 95.5;
        this._alasan = 'Sesuai dengan kapasitas dan ketersediaan ruangan serta logistik';
        this._dibuat_pada = new Date();
        return {
            id_paket: this._id_paket,
            id_fsk: this._id_fsk,
            nama_paket: this._nama_paket,
            skor: this._skor,
            alasan: this._alasan,
        };
    }
    select() {
        this._dipilih = true;
        return true;
    }
    update(data) {
        if (data) {
            if (data.nama_paket)
                this._nama_paket = data.nama_paket;
            if (data.skor !== undefined)
                this._skor = data.skor;
            if (data.alasan)
                this._alasan = data.alasan;
        }
        return true;
    }
    delete() {
        this._dipilih = false;
        return true;
    }
}
//# sourceMappingURL=paket-rekomendasi.entity.js.map