import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { UsersModule } from 'src/modules/users/users.module';

@Module({
  imports: [PrismaModule, UserHotelsModule, UsersModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
