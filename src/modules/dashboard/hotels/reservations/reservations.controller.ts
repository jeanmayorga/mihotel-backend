import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
  UpdateReservationDto,
  UpdateReservationStatusDto,
  CreateReservationRoomDto,
  UpdateReservationRoomDto,
} from './reservations.dto';
import { RequirePermissions } from '../../../../common/decorators/require-permissions.decorator';
import { PermissionsGuard } from '../../../../common/guards/permissions.guard';
import { HotelTimezone } from '../../../../common/decorators/hotel-timezone.decorator';

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

  @Get(':reservationUuid')
  @RequirePermissions('reservations:read')
  async findOne(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
  ) {
    return this.reservationsService.findOne(hotelUuid, reservationUuid);
  }

  @Delete(':reservationUuid')
  @RequirePermissions('reservations:delete')
  delete(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
  ) {
    return this.reservationsService.delete(hotelUuid, reservationUuid);
  }

  @Post()
  @RequirePermissions('reservations:create')
  create(
    @HotelUuid() hotelUuid: string,
    @AuthUserUuid() authUserUuid: string,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.create(hotelUuid, authUserUuid, dto);
  }

  @Patch(':reservationUuid')
  @RequirePermissions('reservations:update')
  async update(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Body() dto: UpdateReservationDto,
  ) {
    const reservation = await this.reservationsService.update(
      hotelUuid,
      reservationUuid,
      dto,
    );
    return { data: reservation };
  }

  @Patch(':reservationUuid/status')
  @RequirePermissions('reservations:update')
  async updateStatus(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Body() dto: UpdateReservationStatusDto,
  ) {
    const reservationRoomsUuids = dto.reservation_room_uuids;
    const status = dto.status;

    const reservation = await this.reservationsService.findOne(
      hotelUuid,
      reservationUuid,
    );
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    for (const reservationRoomUuid of reservationRoomsUuids) {
      if (status === 'pending') {
        await this.reservationRoomsService.pending(reservationRoomUuid);
      }
      if (status === 'confirmed') {
        await this.reservationRoomsService.confirm(reservationRoomUuid);
      }
      if (status === 'checked_in') {
        await this.reservationRoomsService.checkIn(reservationRoomUuid);
      }
      if (status === 'checked_out') {
        await this.reservationRoomsService.checkOut(reservationRoomUuid);
      }
      if (status === 'no_show') {
        await this.reservationRoomsService.noShow(reservationRoomUuid);
      }
      if (status === 'cancelled') {
        await this.reservationRoomsService.cancel(reservationRoomUuid);
      }
    }

    return { data: 'Status updated successfully' };
  }

  @Post(':reservationUuid/rooms')
  @RequirePermissions('reservations:create')
  createReservationRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Body() dto: CreateReservationRoomDto,
  ) {
    return this.reservationRoomsService.create(hotelUuid, reservationUuid, dto);
  }

  @Patch(':reservationUuid/rooms/:reservationRoomUuid')
  @RequirePermissions('reservations:update')
  updateReservationRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('reservationRoomUuid', ParseUUIDPipe) reservationRoomUuid: string,
    @Body() dto: UpdateReservationRoomDto,
  ) {
    return this.reservationRoomsService.update(
      hotelUuid,
      reservationUuid,
      reservationRoomUuid,
      dto,
    );
  }

  @Delete(':reservationUuid/rooms/:reservationRoomUuid')
  @RequirePermissions('reservations:delete')
  removeReservationRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('reservationRoomUuid', ParseUUIDPipe) reservationRoomUuid: string,
  ) {
    return this.reservationRoomsService.remove(
      hotelUuid,
      reservationUuid,
      reservationRoomUuid,
    );
  }
}
