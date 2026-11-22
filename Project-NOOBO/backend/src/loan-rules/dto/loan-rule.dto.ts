import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { toOptionalBoolean } from '../../common/dto/boolean.transform.js';

export class CreateLoanRuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  nama_aturan: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ketentuan: string;
}

export class UpdateLoanRuleDto extends PartialType(CreateLoanRuleDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  aktif?: boolean;
}

export class LoanRuleQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  aktif?: boolean;
}
