import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { UserHotelsService } from './user_hotels.service';

@Module({
  imports: [PrismaModule],
  providers: [UserHotelsService],
  exports: [UserHotelsService],
})
export class UserHotelsModule {}
