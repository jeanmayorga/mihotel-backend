import { Module } from '@nestjs/common';
import { MeController } from './me.controller';
import { MeHotelsModule } from './hotels/hotels.module';

@Module({
  imports: [MeHotelsModule],
  controllers: [MeController],
})
export class MeModule {}
