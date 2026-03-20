BEGIN;

-- Normalize legacy values before tightening allowed statuses.
UPDATE public.hotels_invoices_v2
SET status = 'cancelled'
WHERE status IN ('voided', 'canceled');

ALTER TABLE public.hotels_invoices_v2
DROP CONSTRAINT IF EXISTS hotels_invoices_v2_status_check;

ALTER TABLE public.hotels_invoices_v2
ADD CONSTRAINT hotels_invoices_v2_status_check
CHECK (status IN ('draft', 'issued', 'paid', 'cancelled'));

COMMIT;
