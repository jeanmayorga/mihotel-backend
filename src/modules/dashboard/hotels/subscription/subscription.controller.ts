import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { SubscriptionService } from './subscription.service';
import { UpdateSubscriptionDto } from './subscription.dto';
import { SubscriptionUuid } from 'src/common/decorators/subscription-uuid.decorator';

@ApiTags('Dashboard / Subscription')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  async findOne(@SubscriptionUuid() subscriptionUuid: string) {
    const subscription =
      await this.subscriptionService.findOne(subscriptionUuid);

    return { data: subscription };
  }

  @Patch()
  changePlan(
    @SubscriptionUuid() subscriptionUuid: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.change(subscriptionUuid, dto);
  }
}
