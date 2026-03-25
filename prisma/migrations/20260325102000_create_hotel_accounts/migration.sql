CREATE TYPE "public"."HotelAccountRole" AS ENUM ('owner', 'admin', 'manager', 'receptionist', 'staff');

CREATE TABLE "public"."hotel_accounts" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_uuid" UUID NOT NULL,
    "user_uuid" UUID NOT NULL,
    "role" "public"."HotelAccountRole" NOT NULL DEFAULT 'staff'::"public"."HotelAccountRole",
    "permissions" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "hotel_accounts_pkey" PRIMARY KEY ("uuid"),
    CONSTRAINT "hotel_accounts_hotel_uuid_user_uuid_key" UNIQUE ("hotel_uuid", "user_uuid")
);

CREATE INDEX "idx_hotel_accounts_hotel_uuid"
ON "public"."hotel_accounts"("hotel_uuid");

ALTER TABLE "public"."hotel_accounts"
ADD CONSTRAINT "hotel_accounts_hotel_uuid_fkey"
FOREIGN KEY ("hotel_uuid") REFERENCES "public"."hotels"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."hotel_accounts"
ADD CONSTRAINT "hotel_accounts_user_uuid_fkey"
FOREIGN KEY ("user_uuid") REFERENCES "public"."users"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;
