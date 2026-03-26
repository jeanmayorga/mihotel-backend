import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, Min } from 'class-validator';

export class CreateDiscountDto {
  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;
}
