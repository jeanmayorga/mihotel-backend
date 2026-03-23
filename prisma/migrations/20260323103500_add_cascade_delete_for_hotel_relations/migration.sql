ALTER TABLE "public"."users_hotels"
DROP CONSTRAINT IF EXISTS "users_hotels_hotel_uuid_fkey";

ALTER TABLE "public"."users_hotels"
ADD CONSTRAINT "users_hotels_hotel_uuid_fkey"
FOREIGN KEY ("hotel_uuid") REFERENCES "public"."hotels"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "public"."hotels_rooms_reservations_messages"
DROP CONSTRAINT IF EXISTS "hotels_rooms_reservations_messages_hotel_uuid_fkey";

ALTER TABLE "public"."hotels_rooms_reservations_messages"
ADD CONSTRAINT "hotels_rooms_reservations_messages_hotel_uuid_fkey"
FOREIGN KEY ("hotel_uuid") REFERENCES "public"."hotels"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;
