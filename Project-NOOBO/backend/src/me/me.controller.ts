import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { PaginationDto } from '../common/dto/pagination.dto.js';
import { SubmitReturnDto } from '../loan-requests/dto/loan-lifecycle.dto.js';
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

  @Get(':id/sbpg')
  getSbpg(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.getSbpg(id, user);
  }

  @Post(':id/sbpg')
  @Roles('PEMINJAM')
  submitSbpg(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitReturnDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitSbpg(id, dto, user);
  }
}
