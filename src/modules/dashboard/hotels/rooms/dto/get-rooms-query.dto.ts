import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetRoomsQueryDto {
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
