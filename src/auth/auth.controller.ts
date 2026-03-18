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
      include: {
        users_hotels: {
          include: {
            hotels: {
              select: {
                uuid: true,
                title: true,
                image: true,
                created_at: true,
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
