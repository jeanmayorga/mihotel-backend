import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  invoice_uuid?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'cash' })
  @IsString()
  payment_method: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  paid_at?: Date;
}
