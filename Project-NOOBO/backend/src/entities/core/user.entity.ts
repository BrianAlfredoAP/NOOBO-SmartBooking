export class User {
  private _id_user: number;
  private _role_id: number;
  private _nama: string;
  private _email: string;
  private _password_hash: string;
  private _status_aktif: boolean;
  private _created_at: Date;
  private _whatsapp: string;

  constructor(
    id_user: number,
    role_id: number,
    nama: string,
    email: string,
    password_hash: string,
    status_aktif: boolean = true,
    created_at: Date = new Date(),
    whatsapp: string = '',
  ) {
    this._id_user = id_user;
    this._role_id = role_id;
    this._nama = nama;
    this._email = email;
    this._password_hash = password_hash;
    this._status_aktif = status_aktif;
    this._created_at = created_at;
    this._whatsapp = whatsapp;
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

  public get whatsapp(): string {
    return this._whatsapp;
  }

  // Sensitive field password_hash (-) is exposed only to the auth layer.
  public getPasswordHash(): string {
    return this._password_hash;
  }

  static fromRow(row: Record<string, unknown>): User {
    return new User(
      Number(row.id_user),
      Number(row.role_id),
      String(row.nama),
      String(row.email),
      String(row.password_hash),
      Boolean(row.status_aktif),
      row.created_at instanceof Date ? row.created_at : new Date(String(row.created_at)),
      row.whatsapp == null ? '' : String(row.whatsapp as string | number),
    );
  }

  public updateProfil(newData: Partial<User>): boolean {
    if (newData.nama !== undefined) {
      this._nama = newData.nama;
    }
    if (newData.email !== undefined) {
      this._email = newData.email;
    }
    if (newData.whatsapp !== undefined) {
      this._whatsapp = newData.whatsapp;
    }
    return true;
  }

  public viewDashboard(): object {
    return {
      userId: this._id_user,
      nama: this._nama,
      roleId: this._role_id,
      whatsapp: this._whatsapp,
      status: this._status_aktif ? 'Aktif' : 'Non-Aktif',
    };
  }
}
