import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { ApiTags } from '@nestjs/swagger';

@Controller()
@ApiTags('Public')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('/public/health')
  main() {
    return this.healthService.getHealth();
  }
}
