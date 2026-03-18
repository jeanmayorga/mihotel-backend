import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateAlbumPhotoDto {
  @ApiProperty()
  @IsString()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pathname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;
}
