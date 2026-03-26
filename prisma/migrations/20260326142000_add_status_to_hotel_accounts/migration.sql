-- Add onboarding/status field to hotel accounts.
-- Defaults existing rows to 'pending'.
ALTER TABLE public.hotel_accounts
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

