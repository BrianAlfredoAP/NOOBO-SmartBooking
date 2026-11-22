import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export class FskDetailDto {
  @ApiProperty({ example: 'RUANGAN' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  kategori: string;

  @ApiProperty({ example: 'Auditorium' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  jenis_kebutuhan: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  jumlah: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  keterangan?: string;
}

export class CreateFskDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nama_kegiatan: string;

  @ApiProperty({ example: '2027-01-10' })
  @IsDateString()
  tanggal_mulai: string;

  @ApiProperty({ example: '2027-01-10' })
  @IsDateString()
  tanggal_selesai: string;

  @ApiProperty({ example: '08:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'waktu_mulai harus berformat HH:MM' })
  waktu_mulai: string;

  @ApiProperty({ example: '17:00' })
  @IsString()
  @Matches(TIME_PATTERN, { message: 'waktu_selesai harus berformat HH:MM' })
  waktu_selesai: string;

  @ApiProperty({ example: 100 })
  @Type(() => Number)
  @IsInt()
  jumlah_peserta: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  tujuan_kegiatan: string;

  @ApiPropertyOptional({ type: [FskDetailDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FskDetailDto)
  detail_kebutuhan?: FskDetailDto[];
}

export class UpdateFskDto extends PartialType(CreateFskDto) {}
