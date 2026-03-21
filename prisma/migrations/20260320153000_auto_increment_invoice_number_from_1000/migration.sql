BEGIN;

CREATE SEQUENCE IF NOT EXISTS public.hotels_invoices_v2_invoice_number_seq
  START WITH 1000
  INCREMENT BY 1;

ALTER TABLE public.hotels_invoices_v2
ALTER COLUMN invoice_number TYPE integer
USING (
  CASE
    WHEN invoice_number ~ '^[0-9]+$' THEN invoice_number::integer
    ELSE NULL
  END
);

ALTER TABLE public.hotels_invoices_v2
ALTER COLUMN invoice_number SET DEFAULT nextval('public.hotels_invoices_v2_invoice_number_seq');

UPDATE public.hotels_invoices_v2
SET invoice_number = nextval('public.hotels_invoices_v2_invoice_number_seq')
WHERE invoice_number IS NULL;

SELECT setval(
  'public.hotels_invoices_v2_invoice_number_seq',
  GREATEST((SELECT COALESCE(MAX(invoice_number), 999) FROM public.hotels_invoices_v2), 999),
  true
);

ALTER TABLE public.hotels_invoices_v2
ALTER COLUMN invoice_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_hotels_invoices_v2_invoice_number
ON public.hotels_invoices_v2(invoice_number);

COMMIT;
