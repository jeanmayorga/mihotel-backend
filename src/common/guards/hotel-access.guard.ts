import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserHotelsService } from '../../hotels/user_hotels/user_hotels.service';

@Injectable()
export class HotelAccessGuard implements CanActivate {
  constructor(private readonly userHotelsService: UserHotelsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { authUserUuid?: string }>();

    const hotelUuid = request.params.hotelUuid as string;
    const authUserUuid = request.authUserUuid as string;

    const hasAccess = await this.userHotelsService.hasAccessToHotel(
      authUserUuid,
      hotelUuid,
    );

    if (!hasAccess) {
      throw new ForbiddenException('You do not have access to this hotel');
    }

    return true;
  }
}
