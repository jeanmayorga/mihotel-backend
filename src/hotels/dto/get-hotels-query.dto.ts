import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { parseStrictBooleanQueryParam } from '../../common/helpers/parse-strict-boolean-query-param';

export class GetHotelsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    example: 'title',
    enum: ['title', 'created_at', 'disabled'],
  })
  @Type(() => String)
  @IsOptional()
  @IsString()
  @IsEnum(['title', 'created_at', 'disabled'])
  sortBy?: 'title' | 'created_at' | 'disabled';

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  @Type(() => String)
  @IsOptional()
  @IsString()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: false })
  @Transform(({ value }) => parseStrictBooleanQueryParam(value))
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;
}
