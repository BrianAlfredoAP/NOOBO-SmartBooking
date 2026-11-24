import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { LoanRequestsModule } from '../loan-requests/loan-requests.module.js';
import { NotificationsModule } from '../notifications/notifications.module.js';
import { SbpModule } from '../sbp/sbp.module.js';
import { LogisticsController } from './logistics.controller.js';
import { LogisticsRepository } from './logistics.repository.js';
import { LogisticsService } from './logistics.service.js';

@Module({
  imports: [LoanRequestsModule, NotificationsModule, EmailModule, SbpModule],
  controllers: [LogisticsController],
  providers: [LogisticsRepository, LogisticsService],
})
export class LogisticsModule {}
