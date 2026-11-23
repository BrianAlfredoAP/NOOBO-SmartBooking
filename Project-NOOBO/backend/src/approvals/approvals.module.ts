import { Module } from '@nestjs/common';
import { EmailModule } from '../email/email.module.js';
import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsRepository } from './approvals.repository.js';
import { ApprovalsService } from './approvals.service.js';

@Module({
  imports: [EmailModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsRepository, ApprovalsService],
})
export class ApprovalsModule {}
