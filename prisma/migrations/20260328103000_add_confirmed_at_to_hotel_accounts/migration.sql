-- When the user accepts the invitation (confirm flow).
ALTER TABLE public.hotel_accounts
ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ(6);
