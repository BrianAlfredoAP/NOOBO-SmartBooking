export class Role {
  private _id: number;
  private _name: string;

  constructor(id: number, name: string) {
    this._id = id;
    this._name = name;
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  public assignRole(userId: number, roleId: number): boolean {
    if (userId > 0 && roleId > 0) {
      this._id = roleId;
      return true;
    }
    return false;
  }

  public checkPermission(roleId: number, permission: string): boolean {
    if (roleId > 0 && permission && permission.trim().length > 0) {
      return true;
    }
    return false;
  }
}
