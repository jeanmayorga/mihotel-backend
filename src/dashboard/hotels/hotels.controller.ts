import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { HotelsService } from './hotels.service';
import { AuthRequiredGuard } from '../../common/guards/auth-required.guard';
import { AuthUserUuid } from '../../common/decorators/auth-user-uuid.decorator';
import { HotelUuid } from '../../common/decorators/hotel-uuid.decorator';
import { CreateFreHotelDto, UpdateHotelDto } from './hotels.dto';
import { UserHotelsService } from './user_hotels/user_hotels.service';
import { UserHotelRequiredGuard } from 'src/common/guards/user-hotel-required.guard';

@ApiTags('Dashboard / UserHotels')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('dashboard/user-hotels')
export class HotelsController {
  constructor(
    private readonly hotelsService: HotelsService,
    private readonly userHotelsService: UserHotelsService,
  ) {}

  @Get()
  async findAll(@AuthUserUuid() authUserUuid: string) {
    const userHotels =
      await this.userHotelsService.findAllByUserUuid(authUserUuid);

    return { data: userHotels };
  }

  @Get(':hotelUuid')
  @ApiParam({ name: 'hotelUuid', type: String })
  @UseGuards(UserHotelRequiredGuard)
  async findOne(
    @HotelUuid() hotelUuid: string,
    @AuthUserUuid() authUserUuid: string,
  ) {
    const userHotel =
      await this.userHotelsService.findOneActiveWithSubscription(
        authUserUuid,
        hotelUuid,
      );
    return { data: userHotel };
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
  @UseGuards(UserHotelRequiredGuard)
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
  @UseGuards(UserHotelRequiredGuard)
  @ApiOperation({ summary: 'Delete a hotel' })
  async delete(@HotelUuid() hotelUuid: string) {
    await this.hotelsService.delete(hotelUuid);
    return { data: { message: 'Hotel deleted successfully' } };
  }
}
