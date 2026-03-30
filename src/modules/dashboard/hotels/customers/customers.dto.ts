import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsIn,
  IsUUID,
} from 'class-validator';

import { Type } from 'class-transformer';
export class GetCustomersQueryDto {
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

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'full_name'])
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;

  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class GetCustomerParamsDto {
  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsUUID()
  customerUuid: string;
}
