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

export type UserHotelRequiredGuardRequest = Request & {
  authUserUuid?: string;
  hotelUuid?: string;
  hotelTimezone?: string;
  subscriptionUuid?: string;
};

@Injectable()
export class UserHotelRequiredGuard implements CanActivate {
  private readonly logger = new Logger(UserHotelRequiredGuard.name);
  constructor(private readonly userHotelsService: UserHotelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<UserHotelRequiredGuardRequest>();

    const authUserUuid = request.authUserUuid as string;
    const hotelUuid = request.params.hotelUuid as string;

    if (!authUserUuid) {
      throw new UnauthorizedException('Invalid user uuid');
    }
    if (!hotelUuid) {
      throw new BadRequestException('Invalid hotel uuid');
    }

    const userHotel =
      await this.userHotelsService.findOneActiveWithSubscription(
        authUserUuid,
        hotelUuid,
      );
    const hotel = userHotel?.hotel;
    const timezone = hotel?.timezone || 'America/Guayaquil';

    if (!userHotel || !hotel) {
      this.logger.log(
        `user ${authUserUuid} don't have access to hotel ${hotelUuid}`,
      );
      throw new ForbiddenException('You do not have access to this hotel');
    }

    const subscription = hotel?.subscriptions?.[0];
    const subscriptionUuid = subscription?.uuid;

    this.logger.log(
      `hotelUuid: ${hotelUuid}, subscriptionUuid: ${subscriptionUuid}, timezone: ${timezone}`,
    );

    request.hotelUuid = hotelUuid;
    request.hotelTimezone = timezone;
    request.subscriptionUuid = subscriptionUuid;

    return true;
  }
}
