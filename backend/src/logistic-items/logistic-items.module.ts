import { Module } from '@nestjs/common';
import { LogisticItemsController } from './logistic-items.controller.js';
import { LogisticItemsRepository } from './logistic-items.repository.js';
import { LogisticItemsService } from './logistic-items.service.js';

@Module({
  controllers: [LogisticItemsController],
  providers: [LogisticItemsRepository, LogisticItemsService],
  exports: [LogisticItemsService],
})
export class LogisticItemsModule {}
