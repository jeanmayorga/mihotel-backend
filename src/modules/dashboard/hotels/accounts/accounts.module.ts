import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';

@Module({
  imports: [PrismaModule, UserHotelsModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
