export class Role {
    _id;
    _name;
    constructor(id, name) {
        this._id = id;
        this._name = name;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    assignRole(userId, roleId) {
        if (userId > 0 && roleId > 0) {
            this._id = roleId;
            return true;
        }
        return false;
    }
    checkPermission(roleId, permission) {
        if (roleId > 0 && permission && permission.trim().length > 0) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=role.entity.js.map