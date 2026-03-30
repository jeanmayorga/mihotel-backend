import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from '../../../../common/guards/auth-required.guard';
import { AccountRequiredGuard } from '../../../../common/guards/account-required.guard';
import { HotelUuid } from '../../../../common/decorators/hotel-uuid.decorator';
import { AuthUserUuid } from '../../../../common/decorators/auth-user-uuid.decorator';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { GetCalendarQueryDto } from './dto/get-calendar-query.dto';
import { presentReservationsCalendar } from './reservations-calendar.presenter';
import { ReservationRoomsService } from './reservation-rooms.service';
import {
  GetSummaryQueryDto,
  GetReservationsQueryDto,
  UpdateReservationRoomStatusDto,
} from './reservations.dto';
import { RequirePermissions } from 'src/common/decorators/require-permissions.decorator';
import { PermissionsGuard } from 'src/common/guards/permissions.guard';
import { HotelTimezone } from 'src/common/decorators/hotel-timezone.decorator';

@ApiTags('Dashboard / Reservations')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard, PermissionsGuard)
@Controller('dashboard/hotels/:hotelUuid/reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly reservationRoomsService: ReservationRoomsService,
  ) {}

  @Get('summary')
  @RequirePermissions('reservations:read')
  async summary(
    @HotelUuid() hotelUuid: string,
    @Query() query: GetSummaryQueryDto,
    @HotelTimezone() hotelTimezone: string,
  ) {
    return this.reservationRoomsService.getSummary({
      hotelUuid,
      from: query.from,
      to: query.to,
      orderBy: query.orderBy,
      hotelTimezone,
    });
  }

  @Get()
  @RequirePermissions('reservations:read')
  findAll(
    @HotelUuid() hotelUuid: string,
    @HotelTimezone() hotelTimezone: string,
    @Query() query: GetReservationsQueryDto,
  ) {
    const page = query.page;
    const limit = query.limit;
    const orderBy = query.orderBy;
    const order = query.order;
    const from = query.from;
    const to = query.to;
    const search = query.search;
    const status = query.status;

    return this.reservationRoomsService.findAll({
      hotelUuid,
      page,
      limit,
      orderBy,
      order,
      from,
      to,
      search,
      status,
      roomUuid: query.roomUuid,
      customerUuid: query.customerUuid,
      hotelTimezone,
    });
  }

  @Get('calendar')
  async calendar(
    @HotelUuid() hotelUuid: string,
    @Query() query: GetCalendarQueryDto,
  ) {
    const response = await this.reservationsService.calendar({
      hotelUuid,
      from: query.from,
      to: query.to,
      status: query.status,
    });

    return presentReservationsCalendar(response);
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

  @Delete('rooms/:reservationRoomUuid')
  @RequirePermissions('reservations:delete')
  remove(
    @Param('reservationRoomUuid', ParseUUIDPipe) reservationRoomUuid: string,
  ) {
    return this.reservationRoomsService.remove(reservationRoomUuid);
  }

  @Patch('rooms/:reservationRoomUuid/status')
  @RequirePermissions('reservations:update')
  confirm(
    @Param('reservationRoomUuid', ParseUUIDPipe) reservationRoomUuid: string,
    @Body() dto: UpdateReservationRoomStatusDto,
  ) {
    const status = dto.status;
    if (status === 'pending') {
      return this.reservationRoomsService.pending(reservationRoomUuid);
    }
    if (status === 'confirmed') {
      return this.reservationRoomsService.confirm(reservationRoomUuid);
    }
    if (status === 'checked_in') {
      return this.reservationRoomsService.checkIn(reservationRoomUuid);
    }
    if (status === 'checked_out') {
      return this.reservationRoomsService.checkOut(reservationRoomUuid);
    }
    if (status === 'no_show') {
      return this.reservationRoomsService.noShow(reservationRoomUuid);
    }
    if (status === 'cancelled') {
      return this.reservationRoomsService.cancel(reservationRoomUuid);
    }
    throw new BadRequestException('Invalid status: ' + status);
  }
}
