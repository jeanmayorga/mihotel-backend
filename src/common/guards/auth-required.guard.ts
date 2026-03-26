import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { SupabaseService } from 'src/modules/supabase/supabase.service';

@Injectable()
export class AuthRequiredGuard implements CanActivate {
  private readonly logger = new Logger(AuthRequiredGuard.name);
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { authUserUuid?: string }>();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    try {
      const user = await this.supabaseService.getUserFromAccessToken(token);
      request.authUserUuid = user.id;

      return true;
    } catch (error) {
      this.logger.error(`Invalid token, error: ${error}`);
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
