import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import type { UserRecord } from './users.types.js';

export interface UpdateProfileInput {
  nama?: string;
  whatsapp?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserRecord | null> {
    return this.usersRepository.findById(id);
  }

  async getProfile(id: number) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new UnauthorizedException('Sesi tidak valid');
    return {
      id: user.id_user,
      nama: user.nama,
      email: user.email,
      role: user.role,
      whatsapp: user.whatsapp ?? '',
      status_aktif: user.status_aktif,
    };
  }

  async updateProfile(id: number, input: UpdateProfileInput) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new UnauthorizedException('Sesi tidak valid');
    await this.usersRepository.updateProfile(id, input);
    return this.getProfile(id);
  }
}
