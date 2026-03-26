import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_uuid?: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  unit_price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  total: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  position?: number;
}
