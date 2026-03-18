import { Module } from '@nestjs/common';
import { UserHotelsModule } from './user_hotels/user_hotels.module';
import { HotelsController } from './hotels.controller';
import { HotelsService } from './hotels.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [HotelsController],
  providers: [HotelsService],
})
export class HotelsModule {}
