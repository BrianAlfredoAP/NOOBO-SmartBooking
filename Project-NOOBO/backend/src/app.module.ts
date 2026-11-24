import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ApprovalsModule } from './approvals/approvals.module.js';
import { AuthModule } from './auth/auth.module.js';
import { validateEnvironment } from './config/environment.js';
import { DatabaseModule } from './database/database.module.js';
import { FskModule } from './fsk/fsk.module.js';
import { LoanRequestsModule } from './loan-requests/loan-requests.module.js';
import { LoanRulesModule } from './loan-rules/loan-rules.module.js';
import { LogisticsModule } from './logistics/logistics.module.js';
import { LogisticItemsModule } from './logistic-items/logistic-items.module.js';
import { MeModule } from './me/me.module.js';
import { NotificationsModule } from './notifications/notifications.module.js';
import { PembinaModule } from './pembina/pembina.module.js';
import { RecommendationsModule } from './recommendations/recommendations.module.js';
import { RoomsModule } from './rooms/rooms.module.js';
import { SbpModule } from './sbp/sbp.module.js';
import { UsersModule } from './users/users.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnvironment }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    RoomsModule,
    LogisticItemsModule,
    PembinaModule,
    LoanRulesModule,
    FskModule,
    RecommendationsModule,
    LoanRequestsModule,
    ApprovalsModule,
    LogisticsModule,
    SbpModule,
    MeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
