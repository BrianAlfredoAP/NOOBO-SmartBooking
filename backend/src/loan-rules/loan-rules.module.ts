import { Module } from '@nestjs/common';
import { LoanRulesController } from './loan-rules.controller.js';
import { LoanRulesRepository } from './loan-rules.repository.js';
import { LoanRulesService } from './loan-rules.service.js';

@Module({
  controllers: [LoanRulesController],
  providers: [LoanRulesRepository, LoanRulesService],
  exports: [LoanRulesService],
})
export class LoanRulesModule {}
