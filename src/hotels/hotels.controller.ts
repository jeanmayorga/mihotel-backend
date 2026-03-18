import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { CurrentAuthUserUuid } from '../auth/decorators/current-auth-user-uuid.decorator';

@ApiTags('Hotels')
@ApiBearerAuth()
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@CurrentAuthUserUuid() authUserUuid: string) {
    console.log({ authUserUuid });
    return this.hotelsService.findAll();
  }
}
