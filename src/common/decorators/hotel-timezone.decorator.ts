import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import type { Request } from 'express';

export const HotelTimezone = createParamDecorator(
  (data: undefined, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { hotelTimezone?: string }>();

    const hotelTimezone = request.hotelTimezone;

    if (!hotelTimezone) {
      throw new BadRequestException('Invalid hotel timezone');
    }

    return hotelTimezone;
  },
);
