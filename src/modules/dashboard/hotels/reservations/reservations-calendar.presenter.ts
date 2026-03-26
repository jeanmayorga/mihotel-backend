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

function formatIsoDateOnly(value: Date): string {
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, '0');
  const day = String(value.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

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
