import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiPropertyOptional() name?: string;
  @ApiPropertyOptional() type?: string;
  @ApiPropertyOptional() price?: number;
  @ApiPropertyOptional() capacity?: number;
  @ApiProperty() clean_status: string;
  @ApiPropertyOptional({ type: [String] }) beds?: string[];
  @ApiPropertyOptional({ type: [String] }) amenities?: string[];
  @ApiPropertyOptional() picture?: string;
  @ApiPropertyOptional() room_type_uuid?: string;
  @ApiPropertyOptional() active?: boolean;
}
