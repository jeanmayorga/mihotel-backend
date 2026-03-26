import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  picture?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  full_name?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  email?: string;
}
