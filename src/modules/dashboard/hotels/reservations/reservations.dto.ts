import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator';

export class GetSummaryQueryDto {
  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ default: new Date().toISOString() })
  @IsOptional()
  @IsDateString()
  to?: string;

  @ApiPropertyOptional({ default: 'created_at' })
  @IsOptional()
  @IsString()
  @IsIn(['created_at', 'check_in_date'])
  orderBy?: string;
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

export class GetReservationsQueryDto {
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
  @IsIn(['created_at', 'check_in_date'])
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;

  @ApiPropertyOptional({
    enum: [
      'pending',
      'confirmed',
      'checked_in',
      'checked_out',
      'cancelled',
      'no_show',
    ],
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show',
  ])
  status?: string;

  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsOptional()
  @IsUUID()
  roomUuid?: string;

  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsOptional()
  @IsUUID()
  customerUuid?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsDateString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
