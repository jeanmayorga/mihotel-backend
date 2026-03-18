import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

export interface AuthUser {
  uuid: string;
}

export const CurrentAuthUser = createParamDecorator(
  async (data: undefined, ctx: ExecutionContext): Promise<AuthUser> => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { authUserUuid?: string }>();

    const userUuid: string | undefined = request.authUserUuid;

    if (!userUuid) {
      throw new UnauthorizedException('Unauthorized');
    }

    return { uuid: userUuid };
  },
);
