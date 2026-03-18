import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
