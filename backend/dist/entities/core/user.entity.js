export class User {
    _id_user;
    _role_id;
    _nama;
    _email;
    _password_hash;
    _status_aktif;
    _created_at;
    constructor(id_user, role_id, nama, email, password_hash, status_aktif = true, created_at = new Date()) {
        this._id_user = id_user;
        this._role_id = role_id;
        this._nama = nama;
        this._email = email;
        this._password_hash = password_hash;
        this._status_aktif = status_aktif;
        this._created_at = created_at;
    }
    get id_user() {
        return this._id_user;
    }
    get role_id() {
        return this._role_id;
    }
    get nama() {
        return this._nama;
    }
    get email() {
        return this._email;
    }
    get status_aktif() {
        return this._status_aktif;
    }
    get created_at() {
        return this._created_at;
    }
    verifyPasswordHash(hash) {
        return this._password_hash === hash;
    }
    getPasswordHash() {
        return this._password_hash;
    }
    login(email, pass) {
        if (this._email === email && this._status_aktif && pass && pass.length > 0) {
            return true;
        }
        return false;
    }
    logout(sessionId) {
        return sessionId > 0;
    }
    updateProfil(newData) {
        if (newData.nama !== undefined) {
            this._nama = newData.nama;
        }
        if (newData.email !== undefined) {
            this._email = newData.email;
        }
        return true;
    }
    viewDashboard() {
        return {
            userId: this._id_user,
            nama: this._nama,
            roleId: this._role_id,
            status: this._status_aktif ? 'Aktif' : 'Non-Aktif',
        };
    }
}
//# sourceMappingURL=user.entity.js.map