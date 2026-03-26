import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateTaxDto {
  @ApiProperty({ example: 'IVA' })
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}
