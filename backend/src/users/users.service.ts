import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

export interface UserRecord {
  id_user: number;
  role_id: number;
  role: string;
  nama: string;
  email: string;
  password_hash: string;
  status_aktif: boolean;
  created_at: Date;
}

@Injectable()
export class UsersService {
  private users: UserRecord[] = [];

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers() {
    // Generate bcrypt hash for default test accounts (password: password123)
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

  async findByEmail(email: string): Promise<UserRecord | undefined> {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findById(id: number): Promise<UserRecord | undefined> {
    return this.users.find((u) => u.id_user === id);
  }

  async createUser(data: Omit<UserRecord, 'id_user' | 'created_at'>): Promise<UserRecord> {
    const newUser: UserRecord = {
      ...data,
      id_user: this.users.length + 1,
      created_at: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}
