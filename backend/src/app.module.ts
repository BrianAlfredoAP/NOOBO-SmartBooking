import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { LogisticItemsModule } from './logistic-items/logistic-items.module.js';
import { PembinaModule } from './pembina/pembina.module.js';
import { LoanRulesModule } from './loan-rules/loan-rules.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    LogisticItemsModule,
    PembinaModule,
    LoanRulesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
