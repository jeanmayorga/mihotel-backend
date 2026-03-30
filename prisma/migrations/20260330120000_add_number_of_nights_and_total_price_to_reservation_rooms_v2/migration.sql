ALTER TABLE "public"."hotels_reservations_rooms_v2"
ADD COLUMN "number_of_nights" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "total_price" DECIMAL(10, 2) NOT NULL DEFAULT 0;
