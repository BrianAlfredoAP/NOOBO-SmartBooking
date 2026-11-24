import { Injectable, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import {
  NotificationsRepository,
  type CreateNotifikasiInput,
} from './notifications.repository.js';

@Injectable()
export class NotificationsService {
  constructor(private readonly repository: NotificationsRepository) {}

  async list(user: AuthenticatedUser) {
    const items = await this.repository.findByUser(user.id);
    return {
      message: 'Daftar notifikasi',
      data: items.map((item) => item.viewDetail()),
    };
  }

  async markRead(id: number, user: AuthenticatedUser) {
    const updated = await this.repository.markRead(id, user.id);
    if (!updated) throw new NotFoundException(`Notifikasi ${id} tidak ditemukan`);
    return { message: 'Notifikasi ditandai dibaca' };
  }

  async markAllRead(user: AuthenticatedUser) {
    const count = await this.repository.markAllRead(user.id);
    return { message: `${count} notifikasi ditandai dibaca`, data: { updated: count } };
  }

  /** Dipakai modul lain (mis. keputusan Logistik) untuk mengirim notifikasi. */
  async notify(input: CreateNotifikasiInput): Promise<number> {
    return this.repository.create(input);
  }
}
