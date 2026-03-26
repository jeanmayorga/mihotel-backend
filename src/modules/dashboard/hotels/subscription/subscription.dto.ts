import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class CreateFreeSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  hotel_uuid: string;
}

export class UpdateSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  plan_uuid: string;
}
