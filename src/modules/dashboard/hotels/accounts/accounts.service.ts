import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { HotelAccountRole } from 'generated/prisma/enums';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(hotelUuid: string, dto: CreateAccountDto) {
    this.logger.log(
      `Creating account for user ${dto.user_uuid} in hotel ${hotelUuid}`,
    );

    const existing = await this.prisma.hotel_accounts.findUnique({
      where: {
        hotel_uuid_user_uuid: {
          hotel_uuid: hotelUuid,
          user_uuid: dto.user_uuid,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `User ${dto.user_uuid} already has an account in this hotel`,
      );
    }

    return this.prisma.hotel_accounts.create({
      data: {
        hotel_uuid: hotelUuid,
        user_uuid: dto.user_uuid,
        role: dto.role ?? HotelAccountRole.staff,
        permissions: dto.permissions ?? [],
      },
      include: { user: true },
    });
  }

  async findAll(hotelUuid: string) {
    this.logger.log(`Finding all accounts for hotel ${hotelUuid}`);
    return this.prisma.hotel_accounts.findMany({
      where: { hotel_uuid: hotelUuid },
      include: { user: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(hotelUuid: string, accountUuid: string) {
    const account = await this.prisma.hotel_accounts.findFirst({
      where: { uuid: accountUuid, hotel_uuid: hotelUuid },
      include: { user: true },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountUuid} not found`);
    }

    return account;
  }

  async update(hotelUuid: string, accountUuid: string, dto: UpdateAccountDto) {
    this.logger.log(`Updating account ${accountUuid} in hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, accountUuid);

    return this.prisma.hotel_accounts.update({
      where: { uuid: accountUuid },
      data: dto,
      include: { user: true },
    });
  }

  async remove(hotelUuid: string, accountUuid: string) {
    this.logger.log(`Removing account ${accountUuid} from hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, accountUuid);

    return this.prisma.hotel_accounts.delete({
      where: { uuid: accountUuid },
    });
  }
}
