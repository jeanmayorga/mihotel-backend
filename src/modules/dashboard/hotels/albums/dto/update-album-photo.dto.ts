import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateAlbumPhotoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  pathname?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  position?: number;
}
