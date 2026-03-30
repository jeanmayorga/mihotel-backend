import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateReservationRoomDto {
  @ApiProperty()
  @IsUUID()
  room_uuid: string;

  @ApiProperty()
  @IsDateString()
  check_in_date: string;

  @ApiProperty()
  @IsDateString()
  check_out_date: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  adults_count?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  children_count?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  babies_count?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price_per_night: number;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  number_of_nights: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  total_price: number;
}
