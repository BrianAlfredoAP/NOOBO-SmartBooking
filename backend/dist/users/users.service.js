var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
let UsersService = class UsersService {
    users = [];
    constructor() {
        this.seedDefaultUsers();
    }
    seedDefaultUsers() {
        const saltRounds = 10;
        const defaultPasswordHash = bcrypt.hashSync('password123', saltRounds);
        this.users = [
            {
                id_user: 1,
                role_id: 1,
                role: 'Peminjam',
                nama: 'Mahasiswa Pengaju',
                email: 'mahasiswa@campus.ac.id',
                password_hash: defaultPasswordHash,
                status_aktif: true,
                created_at: new Date(),
            },
            {
                id_user: 2,
                role_id: 2,
                role: 'Pembina',
                nama: 'Pembina Organisasi',
                email: 'pembina@campus.ac.id',
                password_hash: defaultPasswordHash,
                status_aktif: true,
                created_at: new Date(),
            },
            {
                id_user: 3,
                role_id: 1,
                role: 'Peminjam',
                nama: 'User Dinonaktifkan',
                email: 'inactive@campus.ac.id',
                password_hash: defaultPasswordHash,
                status_aktif: false,
                created_at: new Date(),
            },
        ];
    }
    async findByEmail(email) {
        return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    }
    async findById(id) {
        return this.users.find((u) => u.id_user === id);
    }
    async createUser(data) {
        const newUser = {
            ...data,
            id_user: this.users.length + 1,
            created_at: new Date(),
        };
        this.users.push(newUser);
        return newUser;
    }
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map