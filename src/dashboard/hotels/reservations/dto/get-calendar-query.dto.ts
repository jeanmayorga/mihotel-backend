import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional } from 'class-validator';

export class GetCalendarQueryDto {
  @ApiProperty()
  @IsDateString()
  from: string;

  @ApiProperty()
  @IsDateString()
  to: string;

  @ApiPropertyOptional({
    default: 'all',
    enum: [
      'all',
      'pending',
      'confirmed',
      'checked_in',
      'checked_out',
      'cancelled',
    ],
  })
  @IsOptional()
  @IsIn([
    'all',
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
  ])
  status?: string;
}
