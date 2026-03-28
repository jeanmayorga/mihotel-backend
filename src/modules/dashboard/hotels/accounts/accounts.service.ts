import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { HotelAccountRole } from '@prisma/client';
import { SupabaseService } from '../../../supabase/supabase.service';
import { UsersService } from '../../../users/users.service';
import { ResendService } from '../../../resend/resend.service';
import { inviteToHotelTemplate } from '../../../resend/templates/invite-to-hotel.template';

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly supabaseService: SupabaseService,
    private readonly usersService: UsersService,
    private readonly resendService: ResendService,
  ) {}

  async create(hotelUuid: string, dto: CreateAccountDto) {
    this.logger.log(`Creating account for hotel ${hotelUuid}`);

    let userUuid: string;
    const existingUser = await this.usersService.findOneByEmail(dto.email);
    if (existingUser) {
      this.logger.log(`User ${dto.email} already exists, using existing user`);
      userUuid = existingUser.uuid;
    } else {
      this.logger.log(`Creating new supabase user ${dto.email}`);
      const newUser = await this.supabaseService.createUser({
        email: dto.email,
        full_name: dto.full_name,
      });
      userUuid = newUser.id;
    }

    this.logger.log(`Finding hotel ${hotelUuid}`);
    const hotel = await this.prisma.hotels.findUnique({
      where: { uuid: hotelUuid },
      select: { name: true },
    });
    if (!hotel) {
      throw new NotFoundException(`Hotel ${hotelUuid} not found`);
    }
    const hotelName = hotel.name ?? 'Hotel';
    const accountRole = dto.role ?? HotelAccountRole.staff;

    this.logger.log(
      `Creating account for user ${userUuid} in hotel ${hotelUuid}`,
    );
    const newAccount = await this.prisma.hotel_accounts.create({
      data: {
        hotel_uuid: hotelUuid,
        user_uuid: userUuid,
        role: accountRole,
        permissions: dto.permissions ?? [],
        status: 'pending',
      },
      include: { user: true },
    });

    this.logger.log(`Generating magic link for user ${userUuid}`);
    const next = `/confirm-invitation/${newAccount.uuid}`;
    const magicLink = await this.supabaseService.generateLink({
      email: dto.email,
      redirectTo: `${process.env.FRONTEND_URL}/auth/callback?next=${next}`,
    });

    this.logger.log(`Sending invitation email to user ${userUuid}`);
    await this.resendService.sendEmail({
      to: dto.email,
      from: 'noreply@mihotel.app',
      subject: `Invitación a unirse a ${hotelName}`,
      html: inviteToHotelTemplate({
        hotelName,
        accountRole,
        magicLink,
      }),
    });

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

    if (dto.password) {
      await this.supabaseService.updateUser(userUuid, {
        password: dto.password,
      });
    }

    if (dto.full_name || dto.picture) {
      await this.usersService.update(userUuid, {
        full_name: dto.full_name,
        picture: dto.picture,
      });
    }

    const updatedAccount = await this.prisma.hotel_accounts.update({
      where: { uuid: accountUuid },
      data: {
        permissions: dto.permissions,
        role: dto.role,
      },
      include: { user: true },
    });

    return updatedAccount;
  }

  async remove(payload: { userUuid: string; accountUuid: string }) {
    const { userUuid, accountUuid } = payload;

    this.logger.log(`Removing account ${accountUuid}`);
    const account = await this.findOne(accountUuid);

    if (account.user_uuid === userUuid) {
      throw new ForbiddenException(
        'You cannot remove your own account from this hotel',
      );
    }

    if (account.role === HotelAccountRole.owner) {
      throw new ForbiddenException('You cannot remove the owner of the hotel');
    }

    if (account.role === HotelAccountRole.admin) {
      throw new ForbiddenException('You cannot remove the admin of the hotel');
    }

    const deletedAccount = await this.prisma.hotel_accounts.delete({
      where: { uuid: accountUuid },
    });

    return deletedAccount;
  }
}
