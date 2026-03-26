import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class AddItemFromProductDto {
  @ApiProperty()
  @IsUUID()
  product_uuid: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unit_price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
