import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as mysql from 'mysql2/promise.js';
import type { Pool } from 'mysql2/promise.js';
import { DATABASE_POOL, MYSQL_POOL } from './database.constants.js';
import { DatabaseConnectionService } from './database.service.js';

@Global()
@Module({
  providers: [
    {
      provide: MYSQL_POOL,
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
    { provide: DATABASE_POOL, useExisting: MYSQL_POOL },
    DatabaseConnectionService,
  ],
  exports: [MYSQL_POOL, DATABASE_POOL, DatabaseConnectionService],
})
export class DatabaseModule {}
