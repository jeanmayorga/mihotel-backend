import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateRefundDto {
  @ApiProperty()
  @IsUUID()
  payment_uuid: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  reason: string;
}
