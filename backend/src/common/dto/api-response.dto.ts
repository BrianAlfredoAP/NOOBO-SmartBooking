import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PaginationDto, PaginationMetaDto } from './pagination.dto.js';

export class ApiResponseDto<T> {
  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  @ApiPropertyOptional()
  meta?: PaginationMetaDto;
}

export function paginated<T>(
  message: string,
  data: T[],
  total: number,
  query: PaginationDto,
): ApiResponseDto<T[]> {
  return {
    message,
    data,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
