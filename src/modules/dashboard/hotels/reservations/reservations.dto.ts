import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class GetSummaryQueryDto {
  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  to?: string;
}

export class UpdateReservationRoomStatusDto {
  @ApiPropertyOptional({
    enum: [
      'pending',
      'confirmed',
      'checked_in',
      'checked_out',
      'no_show',
      'cancelled',
    ],
  })
  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'no_show',
    'cancelled',
  ])
  status: string;
}
