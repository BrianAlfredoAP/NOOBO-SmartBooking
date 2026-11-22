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
import { CreatePembinaDto, PembinaQueryDto, UpdatePembinaDto } from './dto/pembina.dto.js';
import { PembinaService } from './pembina.service.js';

@ApiTags('Pembina')
@ApiBearerAuth()
@Controller('pembina')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PembinaController {
  constructor(private readonly service: PembinaService) {}

  @Get()
  findAll(@Query() query: PembinaQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('LOGISTIK')
  create(@Body() dto: CreatePembinaDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('LOGISTIK')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePembinaDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('LOGISTIK')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
