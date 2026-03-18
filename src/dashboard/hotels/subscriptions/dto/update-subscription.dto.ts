import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class UpdateSubscriptionDto {
  @ApiProperty()
  @IsUUID()
  plan_uuid: string;
}
