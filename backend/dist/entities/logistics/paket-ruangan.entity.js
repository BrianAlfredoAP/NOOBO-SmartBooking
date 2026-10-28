export class PaketRuangan {
    _id_paket_ruangan;
    _id_paket;
    _id_ruangan;
    constructor(id_paket_ruangan, id_paket, id_ruangan) {
        this._id_paket_ruangan = id_paket_ruangan;
        this._id_paket = id_paket;
        this._id_ruangan = id_ruangan;
    }
    get id_paket_ruangan() {
        return this._id_paket_ruangan;
    }
    get id_paket() {
        return this._id_paket;
    }
    get id_ruangan() {
        return this._id_ruangan;
    }
    addRoom() {
        return this._id_paket > 0 && this._id_ruangan > 0;
    }
    removeRoom() {
        return true;
    }
}
//# sourceMappingURL=paket-ruangan.entity.js.map