import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { KONDISI_FASILITAS } from '../../common/constants.js';
import { PaginationDto } from '../../common/dto/pagination.dto.js';
import { toOptionalBoolean } from '../../common/dto/boolean.transform.js';

export class CreateLogisticItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nama_logistik: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  jenis: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  stok_total: number;

  @ApiPropertyOptional({ enum: KONDISI_FASILITAS })
  @IsOptional()
  @IsIn(KONDISI_FASILITAS)
  kondisi_fasilitas?: string;

  @ApiPropertyOptional({ maxLength: 50 })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  kode_logistik?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lokasi?: string;

  @ApiPropertyOptional({ maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  satuan?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  deskripsi?: string;
}

export class UpdateLogisticItemDto extends PartialType(CreateLogisticItemDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  status_aktif?: boolean;
}

export class LogisticItemQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jenis?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  status_aktif?: boolean;
}

export const LOGISTIC_DEFAULT_KONDISI = 'Baik';
