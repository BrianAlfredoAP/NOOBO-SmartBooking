import { Module } from '@nestjs/common';
import { AllocationsModule } from '../allocations/allocations.module.js';
import { FskModule } from '../fsk/fsk.module.js';
import { RecommendationsController } from './recommendations.controller.js';
import { RecommendationsRepository } from './recommendations.repository.js';
import { RecommendationsService } from './recommendations.service.js';

@Module({
  imports: [FskModule, AllocationsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsRepository, RecommendationsService],
  exports: [RecommendationsRepository, RecommendationsService],
})
export class RecommendationsModule {}
