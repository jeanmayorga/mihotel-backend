import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { AuthUserUuid } from '../../../common/decorators/auth-user-uuid.decorator';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';
import { CreateFreHotelDto, UpdateHotelDto } from './hotels.dto';
import { AccountRequiredGuard } from '../../../common/guards/account-required.guard';

@ApiTags('Dashboard / Hotels')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('dashboard/hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Post('check-slug')
  @ApiOperation({ summary: 'Check if a slug is available for a given city' })
  async checkSlug(
    @Body('slug') slug: string,
    @Body('city_uuid') cityUuid: string,
  ) {
    const result = await this.hotelsService.validateSlug(slug, cityUuid);
    return { data: result };
  }

  @Get()
  async findAll(@AuthUserUuid() authUserUuid: string) {
    const hotels = await this.hotelsService.findAllByUserUuid(authUserUuid);

    return { data: hotels };
  }

  @Get(':hotelUuid')
  @ApiParam({ name: 'hotelUuid', type: String })
  @UseGuards(AccountRequiredGuard)
  async findOne(@HotelUuid() hotelUuid: string) {
    const hotel = await this.hotelsService.findOne(hotelUuid);
    return { data: hotel };
  }

  @ApiOperation({ summary: 'Create a new hotel' })
  @ApiBody({ type: CreateFreHotelDto })
  @Post()
  async create(
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateFreHotelDto,
  ) {
    const hotel = await this.hotelsService.create(authUserUuid, dto);
    return { data: hotel };
  }

  @Patch(':hotelUuid')
  @ApiParam({ name: 'hotelUuid', type: String })
  @UseGuards(AccountRequiredGuard)
  @ApiOperation({ summary: 'Update hotel information' })
  @ApiBody({ type: UpdateHotelDto })
  async update(
    @Param('hotelUuid') hotelUuid: string,
    @Body() dto: UpdateHotelDto,
  ) {
    const hotel = await this.hotelsService.update(hotelUuid, dto);
    return { data: hotel };
  }

  @Delete(':hotelUuid')
  @ApiParam({ name: 'hotelUuid', type: String })
  @UseGuards(AccountRequiredGuard)
  @ApiOperation({ summary: 'Delete a hotel' })
  async delete(@HotelUuid() hotelUuid: string) {
    await this.hotelsService.delete(hotelUuid);
    return { data: { message: 'Hotel deleted successfully' } };
  }
}
