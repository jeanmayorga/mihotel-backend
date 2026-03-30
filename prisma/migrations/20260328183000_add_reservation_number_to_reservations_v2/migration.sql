BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.hotels_reservations_v2_reservation_number_seq
  START WITH 1000
  INCREMENT BY 1;

ALTER TABLE public.hotels_reservations_v2
ADD COLUMN IF NOT EXISTS reservation_number integer;

ALTER TABLE public.hotels_reservations_v2
ALTER COLUMN reservation_number SET DEFAULT nextval('public.hotels_reservations_v2_reservation_number_seq');

UPDATE public.hotels_reservations_v2
SET reservation_number = nextval('public.hotels_reservations_v2_reservation_number_seq')
WHERE reservation_number IS NULL;

SELECT setval(
  'public.hotels_reservations_v2_reservation_number_seq',
  GREATEST((SELECT COALESCE(MAX(reservation_number), 999) FROM public.hotels_reservations_v2), 999),
  true
);

ALTER TABLE public.hotels_reservations_v2
ALTER COLUMN reservation_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_hotels_reservations_v2_reservation_number
ON public.hotels_reservations_v2(reservation_number);

COMMIT;
