import { Module } from '@nestjs/common';
import { EmailRepository } from './email.repository.js';
import { EmailService } from './email.service.js';

@Module({
  providers: [EmailRepository, EmailService],
  exports: [EmailService],
})
export class EmailModule {}
