import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateRoomDto, RoomQueryDto, UpdateRoomDto } from './dto/room.dto.js';
import { RoomsService } from './rooms.service.js';

@ApiTags('Rooms')
@ApiBearerAuth()
@Controller('rooms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  findAll(@Query() query: RoomQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('LOGISTIK')
  create(@Body() dto: CreateRoomDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('LOGISTIK')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoomDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('LOGISTIK')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
