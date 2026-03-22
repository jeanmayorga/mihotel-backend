ALTER TABLE "public"."hotels_subscriptions"
ADD COLUMN "pending_plan_uuid" uuid,
ADD COLUMN "pending_plan_requested_at" timestamptz(6);
