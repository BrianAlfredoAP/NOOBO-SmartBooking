export declare class Role {
    private _id;
    private _name;
    constructor(id: number, name: string);
    get id(): number;
    get name(): string;
    set name(value: string);
    assignRole(userId: number, roleId: number): boolean;
    checkPermission(roleId: number, permission: string): boolean;
}
