import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { HotelAccountRole } from 'generated/prisma/enums';
import { SupabaseService } from 'src/modules/supabase/supabase.service';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async create(hotelUuid: string, dto: CreateAccountDto) {
    this.logger.log(`Creating account for hotel ${hotelUuid}`);

    const newUser = await this.supabaseService.createUser({
      email: dto.email,
      password: dto.password,
    });
    const newUserUuid = newUser.id;
    this.logger.log(`Created new user ${newUserUuid}`);

    const newAccount = await this.prisma.hotel_accounts.create({
      data: {
        hotel_uuid: hotelUuid,
        user_uuid: newUserUuid,
        role: dto.role ?? HotelAccountRole.staff,
        permissions: dto.permissions ?? [],
      },
    });

    this.logger.log(
      `Creating account for user ${newUserUuid} in hotel ${hotelUuid}`,
    );

    return newAccount;
  }

  async findAll(hotelUuid: string) {
    this.logger.log(`Finding all accounts for hotel ${hotelUuid}`);
    return this.prisma.hotel_accounts.findMany({
      where: { hotel_uuid: hotelUuid },
      include: { user: true },
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(accountUuid: string) {
    const account = await this.prisma.hotel_accounts.findFirst({
      where: { uuid: accountUuid },
      include: { user: true },
    });

    if (!account) {
      throw new NotFoundException(`Account ${accountUuid} not found`);
    }

    return account;
  }

  async update(payload: {
    userUuid: string;
    accountUuid: string;
    dto: UpdateAccountDto;
  }) {
    const userUuid = payload.userUuid;
    const accountUuid = payload.accountUuid;
    const dto = payload.dto;

    this.logger.log(`Updating account ${accountUuid}`);

    const account = await this.findOne(accountUuid);
    if (account.user_uuid !== userUuid) {
      throw new ForbiddenException(
        'You are not authorized to update this account',
      );
    }

    if (dto.password) {
      await this.supabaseService.updateUser(userUuid, {
        password: dto.password,
      });
    }

    await this.prisma.hotel_accounts.update({
      where: { uuid: accountUuid },
      data: dto,
      include: { user: true },
    });

    return account;
  }

  async remove(accountUuid: string) {
    this.logger.log(`Removing account ${accountUuid}`);
    await this.findOne(accountUuid);

    return this.prisma.hotel_accounts.delete({
      where: { uuid: accountUuid },
    });
  }
}
