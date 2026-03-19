import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../common/guards/auth-required.guard';
import { HotelRequiredGuard } from '../../../common/guards/hotel-required.guard';
import { HotelUuid } from '../../../common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from '../../../common/decorators/auth-user-uuid.decorator';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetReservationsQueryDto } from './dto/get-reservations-query.dto';

@ApiTags('Dashboard / Reservations')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  findAll(
    @HotelUuid() hotelUuid: string,
    @Query() query: GetReservationsQueryDto,
  ) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const orderBy = String(query.orderBy ?? 'created_at');
    const order = String(query.order ?? 'desc');

    return this.reservationsService.findAll({
      hotelUuid,
      page,
      limit,
      orderBy,
      order,
    });
  }

  @Get(':reservationUuid')
  findOne(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
  ) {
    return this.reservationsService.findOne(hotelUuid, reservationUuid);
  }

  @Post()
  create(
    @HotelUuid() hotelUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(hotelUuid, authUserUuid, dto);
  }

  @Patch(':reservationUuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.update(hotelUuid, reservationUuid, dto);
  }

  @Delete(':reservationUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
  ) {
    return this.reservationsService.remove(hotelUuid, reservationUuid);
  }
}
