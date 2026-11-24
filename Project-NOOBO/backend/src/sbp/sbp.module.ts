import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SbpDownloadController } from './sbp.controller.js';
import { SbpRepository } from './sbp.repository.js';
import { SbpService } from './sbp.service.js';

@Module({
  imports: [ConfigModule],
  controllers: [SbpDownloadController],
  providers: [SbpRepository, SbpService],
  exports: [SbpService],
})
export class SbpModule {}
