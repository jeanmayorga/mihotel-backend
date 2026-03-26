import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateFreHotelDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsUUID()
  country_uuid: string;

  @ApiProperty()
  @IsUUID()
  city_uuid: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;
}

export class UpdateHotelDto {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  disabled?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone_number?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  country_uuid?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  city_uuid?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  timezone?: string;
}
