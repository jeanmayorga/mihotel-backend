import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentAuthUserUuid } from './decorators/current-auth-user-uuid.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentAuthUserUuid() authUserUuid: string) {
    const user = await this.prisma.public_users.findUnique({
      where: { uuid: authUserUuid },
      select: {
        uuid: true,
        email: true,
        full_name: true,
        picture: true,
        phone: true,
        role: true,
        created_at: true,
        users_hotels: {
          select: {
            hotel_uuid: true,
            role: true,
            modules: true,
            hotels: {
              select: {
                uuid: true,
                title: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    return user;
  }
}
