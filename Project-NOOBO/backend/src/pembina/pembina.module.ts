import { Module } from '@nestjs/common';
import { PembinaController } from './pembina.controller.js';
import { PembinaRepository } from './pembina.repository.js';
import { PembinaService } from './pembina.service.js';

@Module({
  controllers: [PembinaController],
  providers: [PembinaRepository, PembinaService],
  exports: [PembinaService],
})
export class PembinaModule {}
