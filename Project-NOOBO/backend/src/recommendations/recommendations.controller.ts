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
import { SelectPackageDto } from './dto/select-package.dto.js';
import { RecommendationsService } from './recommendations.service.js';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('fsk')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RecommendationsController {
  constructor(private readonly service: RecommendationsService) {}

  @Post(':id/recommendations')
  @Roles('PEMINJAM')
  generate(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.generate(id, user);
  }

  @Get(':id/recommendations')
  @Roles('PEMINJAM')
  list(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.list(id, user);
  }

  @Post(':id/select-package')
  @Roles('PEMINJAM')
  select(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SelectPackageDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.service.select(id, dto.id_paket, user);
  }
}
