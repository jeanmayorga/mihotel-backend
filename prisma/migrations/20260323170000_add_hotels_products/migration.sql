CREATE TABLE "public"."hotels_products" (
    "uuid" UUID NOT NULL DEFAULT gen_random_uuid(),
    "hotel_uuid" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2) NOT NULL CHECK ("price" >= 0),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

    CONSTRAINT "hotels_products_pkey" PRIMARY KEY ("uuid")
);

CREATE INDEX "idx_hotels_products_hotel"
ON "public"."hotels_products"("hotel_uuid");

CREATE INDEX "idx_hotels_products_hotel_active"
ON "public"."hotels_products"("hotel_uuid", "is_active");

ALTER TABLE "public"."hotels_products"
ADD CONSTRAINT "hotels_products_hotel_uuid_fkey"
FOREIGN KEY ("hotel_uuid") REFERENCES "public"."hotels"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;
