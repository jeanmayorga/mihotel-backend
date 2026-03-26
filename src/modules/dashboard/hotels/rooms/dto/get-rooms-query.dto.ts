import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

export class GetRoomsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  limit?: number;

  @ApiPropertyOptional({
    default: 'created_at',
    enum: ['name', 'created_at', 'clean_status'],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;
}
