import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Min,
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

export class UpdateReservationDto {
  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsOptional()
  @IsUUID()
  customer_uuid?: string;

  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsOptional()
  @IsUUID()
  invoice_uuid?: string;

  @ApiPropertyOptional({
    example: 'This is a note',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateReservationStatusDto {
  @ApiPropertyOptional({
    example: ['b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7'],
  })
  @IsArray()
  @IsUUID(4, { each: true })
  reservation_room_uuids: string[];

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
  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show',
  ])
  status: string;
}

export class CreateReservationRoomDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsDateString()
  check_in_date: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsDateString()
  check_out_date: string;

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
  @IsString()
  @IsIn([
    'pending',
    'confirmed',
    'checked_in',
    'checked_out',
    'cancelled',
    'no_show',
  ])
  status: string;

  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsUUID()
  room_uuid: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsInt()
  @Min(1)
  adults_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  children_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  babies_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  price_per_night: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  number_of_nights: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsNumber()
  total_price: number;
}

export class UpdateReservationRoomDto {
  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  check_in_date: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  check_out_date: string;

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
  status: string;

  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsOptional()
  @IsUUID()
  room_uuid: string;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  children_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  babies_count: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  price_per_night: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  number_of_nights: number;

  @ApiPropertyOptional({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  total_price: number;
}
