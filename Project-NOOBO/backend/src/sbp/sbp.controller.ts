import { createReadStream } from 'node:fs';
import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/decorators/current-user.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../auth/guards/roles.guard.js';
import { SbpService } from './sbp.service.js';

/** Unduhan SBP untuk pemilik pengajuan maupun Logistik. */
@ApiTags('SBP')
@ApiBearerAuth()
@Controller('me/loan-requests')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SbpDownloadController {
  constructor(private readonly service: SbpService) {}

  @Get(':id/sbp')
  async download(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<StreamableFile> {
    const { data } = await this.service.download(id, user);
    return new StreamableFile(createReadStream(data.file_path), {
      type: 'application/pdf',
      disposition: `inline; filename="${data.nomor_sbp}.pdf"`,
    });
  }
}
