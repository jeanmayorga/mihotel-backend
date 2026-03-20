BEGIN;

UPDATE public.hotels_invoices_payments_v2
SET status = 'confirmed'
WHERE status = 'partially_refunded';

ALTER TABLE public.hotels_invoices_payments_v2
DROP CONSTRAINT IF EXISTS hotels_invoices_payments_v2_status_check;

ALTER TABLE public.hotels_invoices_payments_v2
ADD CONSTRAINT hotels_invoices_payments_v2_status_check
CHECK (
  status IN (
    'pending',
    'confirmed',
    'rejected',
    'refunded'
  )
);

COMMIT;
