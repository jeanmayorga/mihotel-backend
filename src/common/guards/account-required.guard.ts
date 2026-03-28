import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { HotelAccountRole } from 'generated/prisma/enums';
import { PrismaService } from '../../modules/prisma/prisma.service';

@Injectable()
export class AccountRequiredGuard implements CanActivate {
  private readonly logger = new Logger(AccountRequiredGuard.name);
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & {
        authUserUuid?: string;
        hotelUuid?: string;
        accountUuid?: string;
        hotelTimezone?: string;
        subscriptionUuid?: string;
        hotelAccountPermissions?: string[];
        hotelAccountRole?: HotelAccountRole;
      }
    >();

    const authUserUuid = request.authUserUuid as string;
    const hotelUuid = request.params.hotelUuid as string;

    if (!authUserUuid) {
      throw new UnauthorizedException('Invalid user uuid');
    }

    if (!hotelUuid) {
      throw new BadRequestException('Invalid hotel uuid');
    }

    const account = await this.prisma.hotel_accounts.findFirst({
      where: { user_uuid: authUserUuid, hotel_uuid: hotelUuid },
      include: { hotel: { include: { subscriptions: true } } },
    });

    if (!account) {
      throw new ForbiddenException('You do not have access to this hotel');
    }

    if (account.status !== 'confirmed') {
      throw new ForbiddenException('Your account is not confirmed');
    }

    const hotel = account.hotel;
    const timezone = hotel.timezone;

    request.hotelUuid = hotelUuid;
    request.accountUuid = account.uuid;
    request.hotelTimezone = timezone;
    request.subscriptionUuid = hotel.subscriptions[0].uuid;
    request.hotelAccountPermissions = account.permissions;
    request.hotelAccountRole = account.role;

    return true;
  }
}
