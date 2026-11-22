import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import type { UserRecord } from './users.types.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findByEmail(email: string): Promise<UserRecord | null> {
    return this.usersRepository.findByEmail(email);
  }

  async findById(id: number): Promise<UserRecord | null> {
    return this.usersRepository.findById(id);
  }
}
