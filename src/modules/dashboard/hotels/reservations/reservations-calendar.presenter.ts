import { formatIsoDateOnly } from 'src/common/helpers/format-iso-date-only';

type CalendarReservationRecord = Record<string, unknown> & {
  check_in_date: Date;
  check_out_date: Date;
};

type CalendarRoomRecord = Record<string, unknown> & {
  reservations: CalendarReservationRecord[];
};

type ReservationsCalendarResult = {
  data: CalendarRoomRecord[];
};

export function presentReservationsCalendar(
  result: ReservationsCalendarResult,
) {
  return {
    data: {
      rooms: result.data.map((room) => ({
        ...room,
        reservations: room.reservations.map((reservation) => ({
          ...reservation,
          check_in_date: formatIsoDateOnly(reservation.check_in_date),
          check_out_date: formatIsoDateOnly(reservation.check_out_date),
        })),
      })),
    },
  };
}
