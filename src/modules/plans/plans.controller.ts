import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlansService } from './plans.service';

@ApiTags('Plans')
@Controller('/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  async findAll() {
    const plans = await this.plansService.findAll();
    return { data: plans };
  }
}
