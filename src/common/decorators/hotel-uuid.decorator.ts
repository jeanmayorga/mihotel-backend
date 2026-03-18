import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const HotelUuid = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { hotelUuid?: string }>();

    const hotelUuid: string | undefined = request.hotelUuid;

    if (!hotelUuid) {
      throw new BadRequestException('Invalid hotel uuid');
    }

    return hotelUuid;
  },
);
