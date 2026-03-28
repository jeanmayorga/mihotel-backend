import { Module } from '@nestjs/common';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumsPhotosController } from './albums-photos.controller';
import { AlbumsPhotosService } from './albums-photos.service';

@Module({
  controllers: [AlbumsController, AlbumsPhotosController],
  providers: [AlbumsService, AlbumsPhotosService],
})
export class AlbumsModule {}
