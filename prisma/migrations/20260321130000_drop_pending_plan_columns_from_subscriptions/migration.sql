ALTER TABLE "public"."hotels_subscriptions"
DROP COLUMN IF EXISTS "pending_plan_uuid",
DROP COLUMN IF EXISTS "pending_plan_requested_at";
