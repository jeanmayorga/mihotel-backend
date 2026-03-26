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
import { AuthUserUuid } from 'src/common/decorators/auth-user-uuid.decorator';

@ApiTags('Dashboard / Hotel Accounts')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async create(@HotelUuid() hotelUuid: string, @Body() dto: CreateAccountDto) {
    const account = await this.accountsService.create(hotelUuid, dto);
    return { data: account };
  }

  @Get()
  async findAll(@HotelUuid() hotelUuid: string) {
    const accounts = await this.accountsService.findAll(hotelUuid);
    return { data: accounts };
  }

  @Get(':accountUuid')
  async findOne(@Param('accountUuid', ParseUUIDPipe) accountUuid: string) {
    const account = await this.accountsService.findOne(accountUuid);
    return { data: account };
  }

  @Patch(':accountUuid')
  async update(
    @AuthUserUuid() authUserUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
    @Body() dto: UpdateAccountDto,
  ) {
    const account = await this.accountsService.update({
      accountUuid,
      userUuid: authUserUuid,
      dto,
    });
    return { data: account };
  }

  @Delete(':accountUuid')
  async remove(@Param('accountUuid', ParseUUIDPipe) accountUuid: string) {
    const account = await this.accountsService.remove(accountUuid);
    return { data: account };
  }
}
