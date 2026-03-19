import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class GetReservationsQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  order?: string;
}
