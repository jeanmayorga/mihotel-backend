-- Prisma expects public."HotelAccountRole". If the table was created without this
-- migration (or the type was dropped), inserts fail with 42704.

DO $$ BEGIN
  CREATE TYPE "public"."HotelAccountRole" AS ENUM (
    'owner',
    'admin',
    'manager',
    'receptionist',
    'staff'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
DECLARE
  enum_oid oid;
  col_typid oid;
BEGIN
  SELECT t.oid
  INTO enum_oid
  FROM pg_catalog.pg_type t
  JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
  WHERE n.nspname = 'public'
    AND t.typname = 'HotelAccountRole';

  IF enum_oid IS NULL THEN
    RAISE EXCEPTION 'Could not find or create public."HotelAccountRole"';
  END IF;

  SELECT a.atttypid
  INTO col_typid
  FROM pg_catalog.pg_attribute a
  JOIN pg_catalog.pg_class c ON a.attrelid = c.oid
  JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
    AND c.relname = 'hotel_accounts'
    AND a.attname = 'role'
    AND NOT a.attisdropped
    AND a.attnum > 0;

  IF col_typid IS NULL THEN
    RETURN;
  END IF;

  IF col_typid = enum_oid THEN
    RETURN;
  END IF;

  ALTER TABLE public.hotel_accounts
    ALTER COLUMN role DROP DEFAULT;

  ALTER TABLE public.hotel_accounts
    ALTER COLUMN role TYPE public."HotelAccountRole"
    USING (
      CASE
        WHEN trim(both from role::text) IN (
          'owner',
          'admin',
          'manager',
          'receptionist',
          'staff'
        )
        THEN trim(both from role::text)::public."HotelAccountRole"
        ELSE 'staff'::public."HotelAccountRole"
      END
    );

  ALTER TABLE public.hotel_accounts
    ALTER COLUMN role SET DEFAULT 'staff'::public."HotelAccountRole";
END $$;
