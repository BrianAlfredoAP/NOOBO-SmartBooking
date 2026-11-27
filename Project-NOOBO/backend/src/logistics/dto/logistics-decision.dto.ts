import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

const QUEUE_STATUSES = [
  'WAITING_PEMBINA',
  'WAITING_LOGISTIK',
  'REVISION_LOGISTIK',
  'APPROVED_LOGISTIK',
  'REJECTED_LOGISTIK',
  'ONGOING',
  'RETURN_REPORTED',
  'COMPLETED',
] as const;

const RETURN_QUEUE_STATUSES = [
  'PENDING_INSPECTION',
  'RETURN_REPORTED',
  'ONGOING',
  'COMPLETED',
] as const;

export class LogisticsQueueQueryDto extends PaginationDto {
  @ApiPropertyOptional({ enum: QUEUE_STATUSES, description: 'Filter status pengajuan' })
  @IsOptional()
  @IsIn(QUEUE_STATUSES)
  status?: string;
}

export class LogisticsReturnsQueryDto extends PaginationDto {
  @ApiPropertyOptional({
    enum: RETURN_QUEUE_STATUSES,
    description: 'Filter status pengembalian (default PENDING_INSPECTION)',
  })
  @IsOptional()
  @IsIn(RETURN_QUEUE_STATUSES)
  status?: string;
}

export class LogisticsDecisionDto {
  @ApiProperty({ enum: ['APPROVE', 'REVISION', 'REJECT'] })
  @IsIn(['APPROVE', 'REVISION', 'REJECT'])
  keputusan: 'APPROVE' | 'REVISION' | 'REJECT';

  @ApiPropertyOptional({ maxLength: 1000, description: 'Wajib untuk REVISION/REJECT' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  alasan?: string;
}
