import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { FskModule } from '../fsk/fsk.module.js';
import { RecommendationsModule } from '../recommendations/recommendations.module.js';
import { LoanRequestsController } from './loan-requests.controller.js';
import { LoanRequestsRepository } from './loan-requests.repository.js';
import { LoanRequestsService } from './loan-requests.service.js';

@Module({
  imports: [FskModule, RecommendationsModule, EmailModule],
  controllers: [LoanRequestsController],
  providers: [LoanRequestsRepository, LoanRequestsService],
  exports: [LoanRequestsService],
})
export class LoanRequestsModule {}
