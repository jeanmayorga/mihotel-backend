import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_uuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_uuid?: string;

  @ApiPropertyOptional({ default: 'direct' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
