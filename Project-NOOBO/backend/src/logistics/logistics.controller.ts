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
  LogisticsDecisionDto,
  LogisticsQueueQueryDto,
  LogisticsReturnsQueryDto,
} from './dto/logistics-decision.dto.js';
import { InspectionDto } from '../loan-requests/dto/loan-lifecycle.dto.js';
import { LogisticsService } from './logistics.service.js';

@ApiTags('Logistics')
@ApiBearerAuth()
@Controller('logistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LogisticsController {
  constructor(private readonly service: LogisticsService) {}

  @Get('loan-requests')
  @Roles('LOGISTIK')
  queue(@Query() query: LogisticsQueueQueryDto) {
    return this.service.queue(query);
  }

  @Get('loan-requests/:id')
  @Roles('LOGISTIK')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Post('loan-requests/:id/decision')
  @Roles('LOGISTIK')
  decide(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: LogisticsDecisionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.decide(id, dto, user);
  }

  @Post('loan-requests/:id/sbp')
  @Roles('LOGISTIK')
  issueSbp(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.issueSbp(id, user);
  }

  @Get('ongoing-loans')
  @Roles('LOGISTIK')
  ongoing() {
    return this.service.ongoing();
  }

  @Get('returns')
  @Roles('LOGISTIK')
  returnsQueue(@Query() query: LogisticsReturnsQueryDto) {
    return this.service.returnsQueue(query);
  }

  @Get('returns/:id')
  @Roles('LOGISTIK')
  returnDetail(@Param('id', ParseIntPipe) id: number) {
    return this.service.returnDetail(id);
  }

  @Post('returns/:id/inspection')
  @Roles('LOGISTIK')
  recordInspection(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InspectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.recordInspection(id, dto, user);
  }

  @Post('returns/:id/complete')
  @Roles('LOGISTIK')
  completeReturn(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: InspectionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.completeReturn(id, dto, user);
  }
}
