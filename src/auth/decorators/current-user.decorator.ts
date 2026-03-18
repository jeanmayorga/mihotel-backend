import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export const CurrentUserUuid = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const userUuid: string | undefined = request.authUserUuid;

    if (!userUuid) {
      throw new UnauthorizedException('Unauthorized');
    }

    return userUuid;
  },
);
