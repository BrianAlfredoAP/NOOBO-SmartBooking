import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPool, type Pool } from 'mysql2/promise';
import { MYSQL_POOL } from './database.constants.js';
import { DatabaseConnectionService } from './database.service.js';

const poolProvider = {
  provide: MYSQL_POOL,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Pool =>
    createPool({
      host: config.getOrThrow<string>('DB_HOST'),
      port: config.getOrThrow<number>('DB_PORT'),
      user: config.getOrThrow<string>('DB_USER'),
      password: config.getOrThrow<string>('DB_PASSWORD'),
      database: config.getOrThrow<string>('DB_NAME'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
    }),
};

@Module({
  providers: [poolProvider, DatabaseConnectionService],
  exports: [MYSQL_POOL],
})
export class DatabaseModule {}
