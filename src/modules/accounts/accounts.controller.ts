import {
  Controller,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../common/guards/auth-required.guard';
import { AuthUserUuid } from '../../common/decorators/auth-user-uuid.decorator';
import { AccountsService } from './accounts.service';

@ApiTags('Dashboard / Hotel Accounts')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('/accounts')
export class AccountsController {
  private readonly logger = new Logger(AccountsController.name);
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  async findAll(@AuthUserUuid() authUserUuid: string) {
    const accounts = await this.accountsService.findAll({
      userUuid: authUserUuid,
    });
    return { data: accounts };
  }

  @Get(':accountUuid')
  async findOne(
    @AuthUserUuid() authUserUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
  ) {
    const account = await this.accountsService.findOne({
      accountUuid,
      userUuid: authUserUuid,
    });
    return { data: account };
  }

  @Patch(':accountUuid/confirm')
  async confirm(
    @AuthUserUuid() authUserUuid: string,
    @Param('accountUuid', ParseUUIDPipe) accountUuid: string,
  ) {
    const account = await this.accountsService.confirm({
      userUuid: authUserUuid,
      accountUuid,
    });
    return { data: account };
  }
}
