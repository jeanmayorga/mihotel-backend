import { ApiPropertyOptional } from '@nestjs/swagger';
import { HotelAccountRole } from 'generated/prisma/enums';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAccountDto {
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsEmail()
  email: string;

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
  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  full_name?: string;

  @ApiPropertyOptional({ type: String })
  @IsString()
  @IsOptional()
  picture?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  password?: string;

  @ApiPropertyOptional({ enum: HotelAccountRole })
  @IsOptional()
  @IsEnum(HotelAccountRole)
  role?: HotelAccountRole;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  status?: string;
}
