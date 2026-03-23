ALTER TABLE "public"."hotels_reservations_rooms_v2"
DROP CONSTRAINT IF EXISTS "hotels_reservations_rooms_v2_room_uuid_fkey";

ALTER TABLE "public"."hotels_reservations_rooms_v2"
ADD CONSTRAINT "hotels_reservations_rooms_v2_room_uuid_fkey"
FOREIGN KEY ("room_uuid") REFERENCES "public"."hotels_rooms"("uuid")
ON DELETE CASCADE ON UPDATE NO ACTION;
