import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { HotelsModule } from './hotels/hotels.module';
import { AuthModule } from './auth/auth.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { InvoicesV2Module } from './hotels/invoices-v2/invoices-v2.module';
import { RoomsModule } from './hotels/rooms/rooms.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HotelsModule,
    InvoicesV2Module,
    RoomsModule,
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
