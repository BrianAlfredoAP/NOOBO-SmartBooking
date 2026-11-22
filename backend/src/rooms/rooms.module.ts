import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller.js';
import { RoomsRepository } from './rooms.repository.js';
import { RoomsService } from './rooms.service.js';

@Module({
  controllers: [RoomsController],
  providers: [RoomsRepository, RoomsService],
  exports: [RoomsService],
})
export class RoomsModule {}
