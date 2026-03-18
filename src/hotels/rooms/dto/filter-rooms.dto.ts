import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export class FilterRoomsDto {
  @ApiPropertyOptional({ enum: ['name', 'created_at', 'clean_status'] })
  @IsOptional()
  @IsIn(['name', 'created_at', 'clean_status'])
  sortBy?: 'name' | 'created_at' | 'clean_status';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
