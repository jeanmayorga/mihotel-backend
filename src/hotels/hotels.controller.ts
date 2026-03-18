import { Controller, Get } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CurrentUserUuid } from '../auth/decorators/current-user.decorator';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@CurrentUserUuid() userUuid: string) {
    console.log(userUuid);
    return this.hotelsService.findAll();
  }
}
