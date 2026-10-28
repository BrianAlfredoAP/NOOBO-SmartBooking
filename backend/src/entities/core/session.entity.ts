
export class Session {
  private _id_session: number;
  private _id_user: number;
  private _token_hash: string;
  private _waktu_dibuat: Date;
  private _waktu_kedaluwarsa: Date;
  private _status: string;

  constructor(
    id_session: number,
    id_user: number,
    token_hash: string,
    waktu_dibuat: Date = new Date(),
    waktu_kedaluwarsa: Date = new Date(Date.now() + 24 * 60 * 60 * 1000),
    status: string = 'ACTIVE',
  ) {
    this._id_session = id_session;
    this._id_user = id_user;
    this._token_hash = token_hash;
    this._waktu_dibuat = waktu_dibuat;
    this._waktu_kedaluwarsa = waktu_kedaluwarsa;
    this._status = status;
  }

  // Public getters (+)
  public get id_session(): number {
    return this._id_session;
  }

  public get id_user(): number {
    return this._id_user;
  }

  public get waktu_dibuat(): Date {
    return this._waktu_dibuat;
  }

  public get waktu_kedaluwarsa(): Date {
    return this._waktu_kedaluwarsa;
  }

  public get status(): string {
    return this._status;
  }

  // Sensitive token_hash (-) protected
  public getTokenHash(): string {
    return this._token_hash;
  }

  public createSession(userId: number): string {
    this._id_user = userId;
    this._waktu_dibuat = new Date();
    this._waktu_kedaluwarsa = new Date(Date.now() + 24 * 60 * 60 * 1000);
    this._status = 'ACTIVE';
    this._token_hash = `token_${userId}_${Date.now()}`;
    return this._token_hash;
  }

  public validateSession(token: string): boolean {
    const isNotExpired = new Date() < this._waktu_kedaluwarsa;
    const isActive = this._status === 'ACTIVE';
    const isValidToken = Boolean(token && (token === this._token_hash || this._token_hash.includes(token)));
    return isNotExpired && isActive && isValidToken;
  }

  public invalidateSession(sessionId: number): boolean {
    if (this._id_session === sessionId) {
      this._status = 'EXPIRED';
      return true;
    }
    return false;
  }
}
