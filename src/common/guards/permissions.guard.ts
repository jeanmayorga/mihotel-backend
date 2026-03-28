import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { HotelAccountRole } from '@prisma/client';
import { REQUIRED_PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

export type PermissionsGuardRequest = Request & {
  hotelAccountPermissions?: string[];
  hotelAccountRole?: HotelAccountRole;
};

const PRIVILEGED_ROLES: HotelAccountRole[] = [
  HotelAccountRole.owner,
  HotelAccountRole.admin,
];

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<PermissionsGuardRequest>();

    const role = request.hotelAccountRole;
    const permissions = request.hotelAccountPermissions;

    if (permissions === undefined || role === undefined) {
      throw new ForbiddenException(
        'Hotel account context is required to check permissions',
      );
    }

    if (PRIVILEGED_ROLES.includes(role)) {
      return true;
    }

    const granted = new Set(permissions);
    const missing = required.filter((p) => !granted.has(p));
    if (missing.length > 0) {
      throw new ForbiddenException('Insufficient permissions for this action');
    }

    return true;
  }
}
