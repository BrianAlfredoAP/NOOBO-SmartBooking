import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import {
  CancelLoanRequestDto,
  CreateLoanRequestDto,
} from './dto/loan-request.dto.js';
import { LoanRequestsService } from './loan-requests.service.js';

@ApiTags('Loan Requests')
@ApiBearerAuth()
@Controller('loan-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}

  @Get('draft/:fskId')
  @Roles('PEMINJAM')
  draft(
    @Param('fskId', ParseIntPipe) fskId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.draft(fskId, user);
  }

  @Post()
  @Roles('PEMINJAM')
  create(
    @Body() dto: CreateLoanRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.create(dto, user);
  }

  @Post(':id/cancel')
  @Roles('PEMINJAM')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CancelLoanRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.cancel(id, dto, user);
  }
}
