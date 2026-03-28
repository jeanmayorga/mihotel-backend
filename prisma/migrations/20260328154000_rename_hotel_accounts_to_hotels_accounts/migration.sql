DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_catalog.pg_class c
    JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname = 'hotel_accounts'
      AND c.relkind = 'r'
  ) THEN
    ALTER TABLE "public"."hotel_accounts" RENAME TO "hotels_accounts";
  END IF;
END $$;

ALTER INDEX IF EXISTS "public"."hotel_accounts_pkey"
  RENAME TO "hotels_accounts_pkey";

ALTER INDEX IF EXISTS "public"."hotel_accounts_hotel_uuid_user_uuid_key"
  RENAME TO "hotels_accounts_hotel_uuid_user_uuid_key";

ALTER INDEX IF EXISTS "public"."idx_hotel_accounts_hotel_uuid"
  RENAME TO "idx_hotels_accounts_hotel_uuid";

ALTER TABLE IF EXISTS "public"."hotels_accounts"
  RENAME CONSTRAINT "hotel_accounts_hotel_uuid_fkey"
  TO "hotels_accounts_hotel_uuid_fkey";

ALTER TABLE IF EXISTS "public"."hotels_accounts"
  RENAME CONSTRAINT "hotel_accounts_user_uuid_fkey"
  TO "hotels_accounts_user_uuid_fkey";
