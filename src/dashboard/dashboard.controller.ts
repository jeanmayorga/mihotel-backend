import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthUserUuid } from '../common/decorators/auth-user-uuid.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('')
  async get(@AuthUserUuid() authUserUuid: string) {
    return this.dashboardService.getDashboard(authUserUuid);
  }
}
