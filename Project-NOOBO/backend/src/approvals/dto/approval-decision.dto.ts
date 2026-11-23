import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class ApprovalDecisionDto {
  @ApiProperty({ enum: ['APPROVE', 'REJECT'] })
  @IsIn(['APPROVE', 'REJECT'])
  decision: 'APPROVE' | 'REJECT';

  @ApiPropertyOptional({ description: 'Wajib diisi bila keputusan REJECT' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
