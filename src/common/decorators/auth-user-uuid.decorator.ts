import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export const AuthUserUuid = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { authUserUuid?: string }>();

    const authUserUuid: string | undefined = request.authUserUuid;

    if (!authUserUuid) {
      throw new UnauthorizedException('Unauthorized');
    }

    return authUserUuid;
  },
);
