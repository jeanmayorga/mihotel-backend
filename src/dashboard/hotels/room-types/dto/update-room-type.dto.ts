import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoomTypeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
