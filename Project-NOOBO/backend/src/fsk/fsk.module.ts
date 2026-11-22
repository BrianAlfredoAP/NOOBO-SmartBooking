import { Module } from '@nestjs/common';
import { FskController } from './fsk.controller.js';
import { FskRepository } from './fsk.repository.js';
import { FskService } from './fsk.service.js';

@Module({
  controllers: [FskController],
  providers: [FskRepository, FskService],
  exports: [FskService],
})
export class FskModule {}
