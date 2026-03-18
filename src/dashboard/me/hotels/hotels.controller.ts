import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { MeHotelsService } from './hotels.service';
import { AuthUserUuid } from '../../../common/decorators/auth-user-uuid.decorator';

@ApiTags('Dashboard / Me Hotels')
@ApiBearerAuth()
@Controller('dashboard/me/hotels')
export class MeHotelsController {
  constructor(private readonly meHotelsService: MeHotelsService) {}

  @Get()
  findAll(@AuthUserUuid() userUuid: string) {
    return this.meHotelsService.findAll(userUuid);
  }
}
