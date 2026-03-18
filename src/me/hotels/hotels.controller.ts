import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MeHotelsService } from './hotels.service';
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';
import { MeAccessGuard } from 'src/common/guards/me-access.guard';

@ApiTags('Me/Hotels')
@ApiBearerAuth()
@UseGuards(MeAccessGuard)
@Controller('me/hotels')
export class MeHotelsController {
  constructor(private readonly meHotelsService: MeHotelsService) {}

  @Get()
  findAll(@AuthUserUuid() userUuid: string) {
    return this.meHotelsService.findAll(userUuid);
  }
}
