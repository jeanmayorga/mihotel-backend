-- AlterTable: add country to hotels
ALTER TABLE "public"."hotels"
ADD COLUMN IF NOT EXISTS "country_uuid" UUID;

-- Backfill: derive country from selected city when possible
UPDATE "public"."hotels" h
SET "country_uuid" = c."country_uuid"
FROM "public"."cities" c
WHERE h."city_uuid" = c."uuid"
  AND h."country_uuid" IS NULL;

-- AddForeignKey: hotels -> countries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'hotels_country_uuid_fkey'
  ) THEN
    ALTER TABLE "public"."hotels"
      ADD CONSTRAINT "hotels_country_uuid_fkey"
      FOREIGN KEY ("country_uuid") REFERENCES "public"."countries"("uuid")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
