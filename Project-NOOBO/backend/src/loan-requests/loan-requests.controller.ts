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
import {
  CancelLoanRequestDto,
  CreateLoanRequestDto,
} from './dto/loan-request.dto.js';
import {
  InspectionDto,
  LoanRequestQueryDto,
  LogisticsDecisionDto,
  SubmitReturnDto,
} from './dto/loan-lifecycle.dto.js';
import { LoanRequestsService } from './loan-requests.service.js';

@ApiTags('Loan Requests')
@ApiBearerAuth()
@Controller('loan-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanRequestsController {
  constructor(private readonly service: LoanRequestsService) {}

  @Get()
  list(
    @Query() query: LoanRequestQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.list(query, user);
  }

  @Get('draft/:fskId')
  @Roles('PEMINJAM')
  draft(
    @Param('fskId', ParseIntPipe) fskId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.draft(fskId, user);
  }

  @Get(':id')
  detail(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.detail(id, user);
  }

  @Get(':id/history')
  history(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.history(id, user);
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

  @Post(':id/logistics-decision')
  @Roles('LOGISTIK')
  decideLogistics(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LogisticsDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.decideLogistics(id, dto, user);
  }

  @Post(':id/sbp')
  @Roles('LOGISTIK')
  issueSbp(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.issueSbp(id, user);
  }

  @Post(':id/return')
  @Roles('PEMINJAM')
  submitReturn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SubmitReturnDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.submitReturn(id, dto, user);
  }

  @Post(':id/inspection')
  @Roles('LOGISTIK')
  inspect(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InspectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.inspect(id, dto, user);
  }
}
