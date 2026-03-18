import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HotelAccessGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { authUserUuid?: string }>();

    const hotelUuid = request.params.hotelUuid as string;
    const authUserUuid = request.authUserUuid;

    const access = await this.prisma.users_hotels.findFirst({
      where: { hotel_uuid: hotelUuid, user_uuid: authUserUuid },
    });

    if (!access) {
      throw new ForbiddenException('You do not have access to this hotel');
    }

    return true;
  }
}
