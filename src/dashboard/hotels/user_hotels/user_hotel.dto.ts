import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserHotelDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  hotel_uuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_uuid: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  modules?: string[];
}
