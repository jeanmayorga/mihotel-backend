import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: { userUuid: string }) {
    const userUuid = options.userUuid;
    const accounts = await this.prisma.hotels_accounts.findMany({
      where: { user_uuid: userUuid },
      include: {
        hotel: true,
      },
      orderBy: { created_at: 'desc' },
    });
    return accounts;
  }

  async findOne(options: { userUuid: string; accountUuid: string }) {
    const userUuid = options.userUuid;
    const accountUuid = options.accountUuid;

    const account = await this.prisma.hotels_accounts.findUnique({
      where: { uuid: accountUuid, user_uuid: userUuid },
      include: { hotel: true },
    });

    return account;
  }

  async confirm(options: { userUuid: string; accountUuid: string }) {
    const userUuid = options.userUuid;
    const accountUuid = options.accountUuid;
    this.logger.log(`Confirming account ${accountUuid} for user ${userUuid}`);

    const account = await this.findOne({ userUuid, accountUuid });

    if (!account) {
      return null;
    }

    const updatedAccount = await this.prisma.hotels_accounts.update({
      where: { uuid: accountUuid },
      data: { status: 'confirmed', confirmed_at: new Date() },
      select: { status: true, confirmed_at: true },
    });

    return updatedAccount;
  }
}
