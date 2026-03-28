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
import { SubscriptionService } from '../../modules/dashboard/hotels/subscription/subscription.service';

export type SubscriptionRequiredGuardRequest = Request & {
  authUserUuid?: string;
  hotelUuid?: string;
  hotelTimezone?: string;
  subscriptionUuid?: string;
  subscriptionStatus?: string;
};

@Injectable()
export class SubscriptionRequiredGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionRequiredGuard.name);
  constructor(private readonly subscriptionService: SubscriptionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<SubscriptionRequiredGuardRequest>();

    const authUserUuid = request.authUserUuid as string;
    const hotelUuid = request.params.hotelUuid as string;
    const subscriptionUuid = request.subscriptionUuid as string;

    if (!authUserUuid) {
      throw new UnauthorizedException('Invalid user uuid');
    }
    if (!hotelUuid) {
      throw new BadRequestException('Invalid hotel uuid');
    }
    if (!subscriptionUuid) {
      throw new BadRequestException('Invalid subscription uuid');
    }

    const subscription =
      await this.subscriptionService.findOne(subscriptionUuid);
    if (!subscription) {
      throw new ForbiddenException('Subscription not found for this hotel');
    }

    request.subscriptionStatus = subscription.status || 'inactive';

    return true;
  }
}
