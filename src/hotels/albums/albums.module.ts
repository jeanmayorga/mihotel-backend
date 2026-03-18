import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { AlbumsController } from './albums.controller';
import { AlbumsService } from './albums.service';
import { AlbumsPhotosController } from './albums-photos.controller';
import { AlbumsPhotosService } from './albums-photos.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [AlbumsController, AlbumsPhotosController],
  providers: [AlbumsService, AlbumsPhotosService],
})
export class AlbumsModule {}
