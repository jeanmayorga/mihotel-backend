import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const AccountUuid = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { accountUuid?: string }>();

    const accountUuid: string | undefined = request.accountUuid;

    if (!accountUuid) {
      throw new BadRequestException('Invalid account uuid');
    }

    return accountUuid;
  },
);
