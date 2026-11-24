import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto.js';

export class LoanRequestQueryDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter status enum backend' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ReturnItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_alokasi_ruangan?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_alokasi_logistik?: number;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  jumlah_dikembalikan: number;

  @ApiProperty({ enum: ['Baik', 'Rusak', 'Hilang'] })
  @IsIn(['Baik', 'Rusak', 'Hilang'])
  kondisi_kembali: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  catatan?: string;
}

export class SubmitReturnDto {
  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  catatan?: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto_kerusakan?: string;

  @ApiProperty({ type: [ReturnItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ReturnItemDto)
  items: ReturnItemDto[];
}

export class InspectionFindingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_logistik?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id_ruangan?: number;

  @ApiProperty()
  @IsString()
  @MaxLength(50)
  jenis_temuan: string;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  jumlah: number;

  @ApiProperty()
  @IsString()
  @MaxLength(1000)
  deskripsi: string;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  foto_bukti?: string;
}

export class InspectionDto {
  @ApiPropertyOptional({ maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  catatan?: string;

  @ApiPropertyOptional({ type: [InspectionFindingDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InspectionFindingDto)
  temuan?: InspectionFindingDto[];
}
