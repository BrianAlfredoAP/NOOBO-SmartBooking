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
import {
  CreateLogisticItemDto,
  LogisticItemQueryDto,
  UpdateLogisticItemDto,
} from './dto/logistic-item.dto.js';
import { LogisticItemsService } from './logistic-items.service.js';

@ApiTags('Logistic Items')
@ApiBearerAuth()
@Controller('logistic-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticItemsController {
  constructor(private readonly service: LogisticItemsService) {}

  @Get()
  findAll(@Query() query: LogisticItemQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('LOGISTIK')
  create(@Body() dto: CreateLogisticItemDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('LOGISTIK')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLogisticItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('LOGISTIK')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
