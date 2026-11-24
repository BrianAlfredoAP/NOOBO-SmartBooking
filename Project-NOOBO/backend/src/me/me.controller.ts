import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { MeService } from './me.service.js';

@ApiTags('Me')
@ApiBearerAuth()
@Controller('me/loan-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MeController {
  constructor(private readonly service: MeService) {}

  @Get()
  list(@Query() query: PaginationDto, @CurrentUser() user: AuthenticatedUser) {
    return this.service.list(query, user);
  }

  @Get(':id')
  detail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }

  @Get(':id/return-form')
  returnForm(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.returnForm(id, user);
  }
}
