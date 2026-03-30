import {
  Controller,
  Get,
  Logger,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { GetCustomerParamsDto, GetCustomersQueryDto } from './customers.dto';
import { CustomersService } from './customers.service';

@ApiTags('Dashboard / Hotel Customers')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard, PermissionsGuard)
@Controller('dashboard/hotels/:hotelUuid/customers')
export class CustomersController {
  private readonly logger = new Logger(CustomersController.name);
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermissions('customers:read')
  async findAll(
    @HotelUuid() hotelUuid: string,
    @Query() query: GetCustomersQueryDto,
  ) {
    const customers = await this.customersService.findAll({
      hotelUuid,
      ...query,
    });
    return customers;
  }

  @Get(':customerUuid')
  @RequirePermissions('customers:read')
  async findOne(
    @HotelUuid() hotelUuid: string,
    @Param() params: GetCustomerParamsDto,
  ) {
    const customer = await this.customersService.findOne({
      hotelUuid,
      customerUuid: params.customerUuid,
    });
    return { data: customer };
  }
}
