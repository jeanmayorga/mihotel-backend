import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsPositive } from 'class-validator';

export class GetInvoicesQueryDto {
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
  @IsIn(['created_at', 'status', 'total'])
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;
}
