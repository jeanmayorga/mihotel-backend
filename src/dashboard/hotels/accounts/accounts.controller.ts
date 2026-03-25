import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';
import { CreateAccountDto, UpdateAccountDto } from './accounts.dto';
import { AccountsService } from './accounts.service';

@ApiTags('Dashboard / Hotel Accounts')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@HotelUuid() hotelUuid: string) {
    return this.accountsService.findAll(hotelUuid);
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
