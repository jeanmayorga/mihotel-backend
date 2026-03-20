import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateInvoiceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  customer_uuid?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  invoice_number?: string;

  // @ApiPropertyOptional({
  //   default: 'draft',
  //   enum: ['draft', 'issued', 'paid', 'cancelled'],
  // })
  // @IsOptional()
  // @IsIn(['draft', 'issued', 'paid', 'cancelled'])
  // status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
