-- Make `public.users.email` unique for non-empty values.
-- `public.users.email` currently defaults to '' so we use a partial unique index.
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique"
ON public.users (email)
WHERE email <> '';

