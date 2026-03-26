import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(uuid: string) {
    return this.prisma.public_users.findUnique({
      where: { uuid },
    });
  }

  findOneByEmail(email: string) {
    return this.prisma.public_users.findUniqueOrThrow({
      where: { email },
    });
  }

  update(uuid: string, dto: UpdateUserDto) {
    return this.prisma.public_users.update({
      where: { uuid },
      data: {
        picture: dto.picture,
        full_name: dto.full_name,
        email: dto.email,
      },
    });
  }

  delete(uuid: string) {
    return this.prisma.public_users.delete({
      where: { uuid },
    });
  }
}
