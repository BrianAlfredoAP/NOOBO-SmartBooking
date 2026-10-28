export class PaketLogistik {
    _id_paket_logistik;
    _id_paket;
    _id_logistik;
    _jumlah;
    constructor(id_paket_logistik, id_paket, id_logistik, jumlah) {
        this._id_paket_logistik = id_paket_logistik;
        this._id_paket = id_paket;
        this._id_logistik = id_logistik;
        this._jumlah = jumlah;
    }
    get id_paket_logistik() {
        return this._id_paket_logistik;
    }
    get id_paket() {
        return this._id_paket;
    }
    get id_logistik() {
        return this._id_logistik;
    }
    get jumlah() {
        return this._jumlah;
    }
    addLogistic() {
        return this._id_paket > 0 && this._id_logistik > 0 && this._jumlah > 0;
    }
    updateJumlah(jumlah) {
        if (jumlah >= 0) {
            this._jumlah = jumlah;
            return true;
        }
        return false;
    }
    removeLogistic() {
        this._jumlah = 0;
        return true;
    }
}
//# sourceMappingURL=paket-logistik.entity.js.map