import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthUserUuid } from '../common/decorators/auth-user-uuid.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { MeAccessGuard } from 'src/common/guards/me-access.guard';

@ApiBearerAuth()
@UseGuards(MeAccessGuard)
@Controller('me')
export class MeController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('')
  async get(@AuthUserUuid() authUserUuid: string) {
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
