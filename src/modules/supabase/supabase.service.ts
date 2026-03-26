import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { createClient, User } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly logger = new Logger(SupabaseService.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add them to .env (loaded from the project root on startup).',
      );
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  async getUserFromAccessToken(token: string): Promise<User> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);

    if (error || !user?.id) {
      this.logger.error(`Error getting user uuid from access token: ${error}`);
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }

  async getUserById(userId: string): Promise<User> {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);

    if (error) {
      this.logger.error(`Error getting supabase user by id: ${error}`);
      throw new Error(error.message);
    }

    return data.user;
  }

  async createUser(payload: {
    email: string;
    email_confirm?: boolean;
    phone?: string;
    phone_confirm?: boolean;
    // deprecate in the future
    password: string;
    full_name?: string;
    picture?: string;
  }) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      ...payload,
      user_metadata: {
        full_name: payload.full_name,
        picture: payload.picture,
      },
    });

    if (error) {
      this.logger.error(`Error creating supabase user: ${error}`);
      throw new Error(error.message);
    }

    return data.user;
  }

  async deleteUser(userId: string) {
    const { data, error } = await this.supabase.auth.admin.deleteUser(userId);

    if (error) {
      this.logger.error(`Error deleting supabase user: ${error}`);
      throw new Error(error.message);
    }

    return data.user;
  }

  async updateUser(
    userId: string,
    payload: {
      password?: string;
      email_confirm?: boolean;
      phone_confirm?: boolean;
      ban_duration?: string;
    },
  ) {
    const { data, error } = await this.supabase.auth.admin.updateUserById(
      userId,
      payload,
    );

    if (error) {
      this.logger.error(`Error updating supabase user: ${error}`);
      throw new Error(error.message);
    }

    return data.user;
  }
}
