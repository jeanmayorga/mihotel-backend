import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { HotelRequiredGuard } from 'src/common/guards/hotel-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { AccountsService } from './accounts.service';

@ApiTags('Dashboard / Hotel Accounts')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(hotelUuid, dto);
  }

  @Get()
  async findAll(@HotelUuid() hotelUuid: string) {
    const accounts = await this.accountsService.findAll(hotelUuid);
    this.logger.log(`Found ${accounts.length} accounts for hotel ${hotelUuid}`);
    return { data: accounts };
  }

  @Get(':accountUuid')
  findOne(
    @HotelUuid() hotelUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
  ) {
    return this.accountsService.findOne(hotelUuid, accountUuid);
  }

  @Patch(':accountUuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(hotelUuid, accountUuid, dto);
  }

  @Delete(':accountUuid')
  remove(
    @HotelUuid() hotelUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
  ) {
    return this.accountsService.remove(hotelUuid, accountUuid);
  }
}
