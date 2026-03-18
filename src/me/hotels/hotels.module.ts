import { Module } from '@nestjs/common';
import { MeHotelsController } from './hotels.controller';
import { MeHotelsService } from './hotels.service';

@Module({
  imports: [],
  controllers: [MeHotelsController],
  providers: [MeHotelsService],
})
export class MeHotelsModule {}
