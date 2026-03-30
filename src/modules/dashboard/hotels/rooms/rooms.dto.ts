import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetRoomParamsDto {
  @ApiPropertyOptional({
    example: 'b7b6f4f5-3ec0-4a11-a6fd-4fd09ab0f8f7',
  })
  @IsUUID()
  uuid: string;
}
