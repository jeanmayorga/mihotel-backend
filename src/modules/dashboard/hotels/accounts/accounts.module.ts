import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../prisma/prisma.module';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { UsersModule } from '../../../users/users.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
