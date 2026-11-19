import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import type { Pool } from 'mysql2/promise';
import { MYSQL_POOL } from './database.constants.js';

@Injectable()
export class DatabaseConnectionService
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly logger = new Logger(DatabaseConnectionService.name);

  constructor(@Inject(MYSQL_POOL) private readonly pool: Pool) {}

  async onModuleInit(): Promise<void> {
    try {
      const connection = await this.pool.getConnection();
      try {
        await connection.ping();
      } finally {
        connection.release();
      }
      this.logger.log('Connected to the configured MySQL database.');
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      this.logger.error(`Could not connect to MySQL: ${detail}`);
      await this.pool.end().catch((closeError: unknown) => {
        const closeDetail =
          closeError instanceof Error ? closeError.message : String(closeError);
        this.logger.error(`Could not close the failed MySQL pool: ${closeDetail}`);
      });
      throw new Error(
        'MySQL connection failed. Check that MySQL is running and DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in .env are correct.',
        { cause: error },
      );
    }
  }

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
    this.logger.log('MySQL connection pool closed.');
  }
}
