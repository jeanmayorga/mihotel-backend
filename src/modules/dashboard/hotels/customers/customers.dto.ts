import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsPositive,
  IsIn,
  IsDateString,
} from 'class-validator';

import { Type } from 'class-transformer';
export class GetCustomersQueryDto {
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
  @IsIn(['created_at', 'full_name'])
  orderBy?: string;

  @ApiPropertyOptional({ default: 'desc' })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: string;

  @ApiPropertyOptional({
    example: 'search',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

export class CreateCustomerDto {
  @ApiPropertyOptional()
  @IsString()
  full_name: string;

  @ApiPropertyOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  document: string;

  @ApiPropertyOptional()
  @IsString()
  document_id: string;

  @ApiPropertyOptional()
  @IsString()
  phone_country_code: string;

  @ApiPropertyOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  verifed_whatsapp_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  verified_cedula_at?: string;
}

export class UpdateCustomerDto {
  @ApiPropertyOptional()
  @IsString()
  full_name: string;

  @ApiPropertyOptional()
  @IsString()
  email: string;

  @ApiPropertyOptional()
  @IsString()
  document: string;

  @ApiPropertyOptional()
  @IsString()
  document_id: string;

  @ApiPropertyOptional()
  @IsString()
  phone_country_code: string;

  @ApiPropertyOptional()
  @IsString()
  phone: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  verifed_whatsapp_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  verified_cedula_at?: string;
}
