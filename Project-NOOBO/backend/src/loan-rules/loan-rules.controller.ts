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
  CreateLoanRuleDto,
  LoanRuleQueryDto,
  UpdateLoanRuleDto,
} from './dto/loan-rule.dto.js';
import { LoanRulesService } from './loan-rules.service.js';

@ApiTags('Loan Rules')
@ApiBearerAuth()
@Controller('loan-rules')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoanRulesController {
  constructor(private readonly service: LoanRulesService) {}

  @Get()
  findAll(@Query() query: LoanRuleQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @Roles('LOGISTIK')
  create(@Body() dto: CreateLoanRuleDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @Roles('LOGISTIK')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateLoanRuleDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Roles('LOGISTIK')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
