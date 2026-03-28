import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { UsersModule } from 'src/modules/users/users.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, UsersModule],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
