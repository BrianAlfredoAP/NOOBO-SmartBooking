import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { CreateFskDto, UpdateFskDto } from './dto/fsk.dto.js';
import { FskService } from './fsk.service.js';

@ApiTags('FSK')
@ApiBearerAuth()
@Controller('fsk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FskController {
  constructor(private readonly service: FskService) {}

  @Post()
  @Roles('PEMINJAM')
  create(@Body() dto: CreateFskDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Roles('PEMINJAM')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateFskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.update(id, dto, user);
  }
}
