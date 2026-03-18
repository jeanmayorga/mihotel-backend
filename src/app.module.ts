import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HotelsModule } from './hotels/hotels.module';

@Module({
  imports: [PrismaModule, HotelsModule],
  controllers: [AppController],
})
export class AppModule {}
