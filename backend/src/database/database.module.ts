import {
  Global,
  Module,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise.js';
import type { Pool } from 'mysql2/promise.js';
import { DATABASE_POOL } from './database.constants.js';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      inject: [ConfigService],
      useFactory: (config: ConfigService): Pool =>
        mysql.createPool({
          host: config.get<string>('DB_HOST'),
          port: Number(config.get<string>('DB_PORT') ?? '3306'),
          user: config.get<string>('DB_USER'),
          password: config.get<string>('DB_PASSWORD'),
          database: config.get<string>('DB_NAME'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
        }),
    },
  ],
  exports: [DATABASE_POOL],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(DATABASE_POOL) private readonly pool: Pool) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.pool.query('SELECT 1');
      this.logger.log('Koneksi MySQL berhasil');
    } catch (error) {
      const code =
        error instanceof Error && 'code' in error
          ? ` (${String((error as Error & { code?: string }).code)})`
          : '';
      this.logger.error(
        `Koneksi MySQL gagal${code}. Pastikan MySQL berjalan dan cek DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME di backend/.env`,
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
