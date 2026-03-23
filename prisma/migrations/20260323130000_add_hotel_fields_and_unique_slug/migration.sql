-- CreateTable: countries
CREATE TABLE "public"."countries" (
    "uuid"    UUID NOT NULL DEFAULT gen_random_uuid(),
    "name"    TEXT NOT NULL,
    "code"    TEXT NOT NULL,
    "slug"    TEXT NOT NULL,
    CONSTRAINT "countries_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex: unique constraints on countries
CREATE UNIQUE INDEX "countries_code_key" ON "public"."countries"("code");
CREATE UNIQUE INDEX "countries_slug_key" ON "public"."countries"("slug");

-- CreateTable: cities
CREATE TABLE "public"."cities" (
    "uuid"         UUID NOT NULL DEFAULT gen_random_uuid(),
    "name"         TEXT NOT NULL,
    "slug"         TEXT NOT NULL,
    "country_uuid" UUID NOT NULL,
    CONSTRAINT "cities_pkey" PRIMARY KEY ("uuid")
);

-- CreateIndex: unique slug per country in cities
CREATE UNIQUE INDEX "cities_country_uuid_slug_key" ON "public"."cities"("country_uuid", "slug");

-- AddForeignKey: cities -> countries
ALTER TABLE "public"."cities"
    ADD CONSTRAINT "cities_country_uuid_fkey"
    FOREIGN KEY ("country_uuid") REFERENCES "public"."countries"("uuid")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: add new fields to hotels
ALTER TABLE "public"."hotels"
ADD COLUMN "name"      TEXT,
ADD COLUMN "email"     TEXT,
ADD COLUMN "address"   TEXT,
ADD COLUMN "city_uuid" UUID,
ADD COLUMN "currency"  TEXT DEFAULT 'USD',
ADD COLUMN "latitude"  DECIMAL(10,6),
ADD COLUMN "longitude" DECIMAL(10,6);

-- AddForeignKey: hotels -> cities
ALTER TABLE "public"."hotels"
    ADD CONSTRAINT "hotels_city_uuid_fkey"
    FOREIGN KEY ("city_uuid") REFERENCES "public"."cities"("uuid")
    ON DELETE SET NULL ON UPDATE CASCADE;

-- Drop old global unique constraint on slug
ALTER TABLE "public"."hotels" DROP CONSTRAINT IF EXISTS "hotels_slug_key";

-- CreateIndex: unique slug per city in hotels
CREATE UNIQUE INDEX "hotels_city_uuid_slug_key" ON "public"."hotels"("city_uuid", "slug");
