import { Module } from '@nestjs/common';
import { AllocationsRepository } from './allocations.repository.js';

@Module({
  providers: [AllocationsRepository],
  exports: [AllocationsRepository],
})
export class AllocationsModule {}
