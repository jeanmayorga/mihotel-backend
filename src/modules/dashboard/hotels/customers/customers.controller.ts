import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import {
  CreateCustomerDto,
  GetCustomersQueryDto,
  UpdateCustomerDto,
} from './customers.dto';
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
    @Param('customerUuid') customerUuid: string,
  ) {
    const customer = await this.customersService.findOne({
      hotelUuid,
      customerUuid,
    });
    return { data: customer };
  }

  @Post()
  @RequirePermissions('customers:create')
  async create(
    @HotelUuid() hotelUuid: string,
    @Body() body: CreateCustomerDto,
  ) {
    const customer = await this.customersService.create({
      hotelUuid,
      payload: body,
    });
    return { data: customer };
  }

  @Put(':customerUuid')
  @RequirePermissions('customers:update')
  async update(
    @HotelUuid() hotelUuid: string,
    @Param('customerUuid') customerUuid: string,
    @Body() body: UpdateCustomerDto,
  ) {
    const customer = await this.customersService.update({
      hotelUuid,
      customerUuid,
      payload: body,
    });

    return { data: customer };
  }

  @Delete(':customerUuid')
  @RequirePermissions('customers:delete')
  @HttpCode(204)
  async delete(
    @HotelUuid() hotelUuid: string,
    @Param('customerUuid') customerUuid: string,
  ) {
    await this.customersService.delete({
      hotelUuid,
      customerUuid,
    });
  }
}
