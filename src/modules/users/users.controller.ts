import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/me')
  async findMe(@AuthUserUuid() authUserUuid: string) {
    const user = await this.usersService.findOne(authUserUuid);
    return { data: user };
  }
}
