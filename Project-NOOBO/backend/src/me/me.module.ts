import { Module } from '@nestjs/common';
import { LoanRequestsModule } from '../loan-requests/loan-requests.module.js';
import { MeController } from './me.controller.js';
import { MeService } from './me.service.js';

@Module({
  imports: [LoanRequestsModule],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
