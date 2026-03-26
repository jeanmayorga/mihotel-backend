import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HotelAccountRole } from 'generated/prisma/enums';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAccountDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  user_uuid: string;

  @ApiPropertyOptional({
    enum: HotelAccountRole,
    default: HotelAccountRole.staff,
  })
  @IsOptional()
  @IsEnum(HotelAccountRole)
  role?: HotelAccountRole;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}

export class UpdateAccountDto {
  @ApiPropertyOptional({ enum: HotelAccountRole })
  @IsOptional()
  @IsEnum(HotelAccountRole)
  role?: HotelAccountRole;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
