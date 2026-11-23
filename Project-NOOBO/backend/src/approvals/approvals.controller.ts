import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApprovalDecisionDto } from './dto/approval-decision.dto.js';
import { ApprovalsService } from './approvals.service.js';

@ApiTags('Approvals')
@Controller('approvals')
export class ApprovalsController {
  constructor(private readonly service: ApprovalsService) {}

  @Get(':token')
  get(@Param('token') token: string) {
    return this.service.get(token);
  }

  @Post(':token/decision')
  decide(
    @Param('token') token: string,
    @Body() dto: ApprovalDecisionDto,
  ) {
    return this.service.decide(token, dto);
  }
}
