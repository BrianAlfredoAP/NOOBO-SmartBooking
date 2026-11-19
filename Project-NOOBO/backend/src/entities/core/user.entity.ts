export class User {
  private _id_user: number;
  private _role_id: number;
  private _nama: string;
  private _email: string;
  private _password_hash: string;
  private _status_aktif: boolean;
  private _created_at: Date;

  constructor(
    id_user: number,
    role_id: number,
    nama: string,
    email: string,
    password_hash: string,
    status_aktif: boolean = true,
    created_at: Date = new Date(),
  ) {
    this._id_user = id_user;
    this._role_id = role_id;
    this._nama = nama;
    this._email = email;
    this._password_hash = password_hash;
    this._status_aktif = status_aktif;
    this._created_at = created_at;
  }

  // Public getters (+)
  public get id_user(): number {
    return this._id_user;
  }

  public get role_id(): number {
    return this._role_id;
  }

  public get nama(): string {
    return this._nama;
  }

  public get email(): string {
    return this._email;
  }

  public get status_aktif(): boolean {
    return this._status_aktif;
  }

  public get created_at(): Date {
    return this._created_at;
  }

  // Sensitive field password_hash (-) is kept private / protected.
  // Internal method to retrieve or compare password hash for auth layer
  public verifyPasswordHash(hash: string): boolean {
    return this._password_hash === hash;
  }

  public getPasswordHash(): string {
    return this._password_hash;
  }

  public login(email: string, pass: string): boolean {
    if (this._email === email && this._status_aktif && pass && pass.length > 0) {
      return true;
    }
    return false;
  }

  public logout(sessionId: number): boolean {
    return sessionId > 0;
  }

  public updateProfil(newData: Partial<User>): boolean {
    if (newData.nama !== undefined) {
      this._nama = newData.nama;
    }
    if (newData.email !== undefined) {
      this._email = newData.email;
    }
    return true;
  }

  public viewDashboard(): object {
    return {
      userId: this._id_user,
      nama: this._nama,
      roleId: this._role_id,
      status: this._status_aktif ? 'Aktif' : 'Non-Aktif',
    };
  }
}
