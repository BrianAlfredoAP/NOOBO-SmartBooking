export class Session {
    _id_session;
    _id_user;
    _token_hash;
    _waktu_dibuat;
    _waktu_kedaluwarsa;
    _status;
    constructor(id_session, id_user, token_hash, waktu_dibuat = new Date(), waktu_kedaluwarsa = new Date(Date.now() + 24 * 60 * 60 * 1000), status = 'ACTIVE') {
        this._id_session = id_session;
        this._id_user = id_user;
        this._token_hash = token_hash;
        this._waktu_dibuat = waktu_dibuat;
        this._waktu_kedaluwarsa = waktu_kedaluwarsa;
        this._status = status;
    }
    get id_session() {
        return this._id_session;
    }
    get id_user() {
        return this._id_user;
    }
    get waktu_dibuat() {
        return this._waktu_dibuat;
    }
    get waktu_kedaluwarsa() {
        return this._waktu_kedaluwarsa;
    }
    get status() {
        return this._status;
    }
    getTokenHash() {
        return this._token_hash;
    }
    createSession(userId) {
        this._id_user = userId;
        this._waktu_dibuat = new Date();
        this._waktu_kedaluwarsa = new Date(Date.now() + 24 * 60 * 60 * 1000);
        this._status = 'ACTIVE';
        this._token_hash = `token_${userId}_${Date.now()}`;
        return this._token_hash;
    }
    validateSession(token) {
        const isNotExpired = new Date() < this._waktu_kedaluwarsa;
        const isActive = this._status === 'ACTIVE';
        const isValidToken = Boolean(token && (token === this._token_hash || this._token_hash.includes(token)));
        return isNotExpired && isActive && isValidToken;
    }
    invalidateSession(sessionId) {
        if (this._id_session === sessionId) {
            this._status = 'EXPIRED';
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=session.entity.js.map