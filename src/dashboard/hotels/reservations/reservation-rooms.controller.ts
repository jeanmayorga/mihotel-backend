import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
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
import { ReservationRoomsService } from './reservation-rooms.service';
import { CreateReservationRoomDto } from './dto/create-reservation-room.dto';

@ApiTags('Dashboard / Reservation Rooms')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, HotelRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/reservations/:reservationUuid/rooms')
export class ReservationRoomsController {
  constructor(
    private readonly reservationRoomsService: ReservationRoomsService,
  ) {}

  @Post()
  addRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Body() dto: CreateReservationRoomDto,
  ) {
    return this.reservationRoomsService.addRoom(
      hotelUuid,
      reservationUuid,
      dto,
    );
  }

  @Patch(':roomUuid')
  updateRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
    @Body() dto: CreateReservationRoomDto,
  ) {
    return this.reservationRoomsService.updateRoom(
      hotelUuid,
      reservationUuid,
      roomUuid,
      dto,
    );
  }

  @Delete(':roomUuid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRoom(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
  ) {
    return this.reservationRoomsService.removeRoom(
      hotelUuid,
      reservationUuid,
      roomUuid,
    );
  }

  @Post(':roomUuid/confirm')
  confirm(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
  ) {
    return this.reservationRoomsService.confirm(
      hotelUuid,
      reservationUuid,
      roomUuid,
    );
  }

  @Post(':roomUuid/check-in')
  checkIn(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
  ) {
    return this.reservationRoomsService.checkIn(
      hotelUuid,
      reservationUuid,
      roomUuid,
    );
  }

  @Post(':roomUuid/check-out')
  checkOut(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
  ) {
    return this.reservationRoomsService.checkOut(
      hotelUuid,
      reservationUuid,
      roomUuid,
    );
  }

  @Post(':roomUuid/cancel')
  cancel(
    @HotelUuid() hotelUuid: string,
    @Param('reservationUuid', ParseUUIDPipe) reservationUuid: string,
    @Param('roomUuid', ParseUUIDPipe) roomUuid: string,
  ) {
    return this.reservationRoomsService.cancel(
      hotelUuid,
      reservationUuid,
      roomUuid,
    );
  }
}
