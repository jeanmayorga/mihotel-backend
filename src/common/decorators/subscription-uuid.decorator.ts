import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const SubscriptionUuid = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { subscriptionUuid?: string }>();

    const subscriptionUuid: string | undefined = request.subscriptionUuid;

    if (!subscriptionUuid) {
      throw new BadRequestException('Invalid subscription uuid');
    }

    return subscriptionUuid;
  },
);
