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
import { LoanRequestQueryDto } from './dto/loan-lifecycle.dto.js';
import { LoanRequestsService } from './loan-requests.service.js';

@ApiTags('History')
@ApiBearerAuth()
@Controller('history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HistoryController {
  constructor(private readonly service: LoanRequestsService) {}

  @Get()
  list(
    @Query() query: LoanRequestQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.historyList(query, user);
  }

  @Get(':id')
  detail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }
}
