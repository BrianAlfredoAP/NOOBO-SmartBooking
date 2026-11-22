import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { toOptionalBoolean } from '../../common/dto/boolean.transform.js';

export class CreatePembinaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_pembina: string;

  @ApiProperty()
  @IsEmail({}, { message: 'Format email Pembina tidak valid' })
  @MaxLength(100)
  email_pembina: string;
}

export class UpdatePembinaDto extends PartialType(CreatePembinaDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  status_aktif?: boolean;
}

export class PembinaQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  status_aktif?: boolean;
}
