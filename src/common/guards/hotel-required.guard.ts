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
import { UserHotelsService } from '../../dashboard/hotels/user_hotels/user_hotels.service';

@Injectable()
export class HotelRequiredGuard implements CanActivate {
  private readonly logger = new Logger(HotelRequiredGuard.name);
  constructor(private readonly userHotelsService: UserHotelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<
      Request & {
        authUserUuid?: string;
        hotelUuid?: string;
        hotelTimezone?: string;
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

    const { hasAccess, timezone } =
      await this.userHotelsService.getHotelContext(authUserUuid, hotelUuid);

    if (!hasAccess) {
      this.logger.log(
        `hasAccess: false, authUserUuid: ${authUserUuid}, hotelUuid: ${hotelUuid}`,
      );
      throw new ForbiddenException('You do not have access to this hotel');
    }

    this.logger.log(
      `hasAccess: true, authUserUuid: ${authUserUuid}, hotelUuid: ${hotelUuid}`,
    );

    request.hotelUuid = hotelUuid;
    request.hotelTimezone = timezone;

    return true;
  }
}
