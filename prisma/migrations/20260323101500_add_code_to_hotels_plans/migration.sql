ALTER TABLE "public"."hotels_plans"
ADD COLUMN "code" TEXT;

UPDATE "public"."hotels_plans"
SET "code" = 'free'
WHERE "uuid" = '658d0214-1779-44f1-bc75-619477d6f838';

UPDATE "public"."hotels_plans"
SET "code" = 'basic'
WHERE "uuid" = '4bc8f54c-dda3-48c9-923d-eb089c60df2a';

UPDATE "public"."hotels_plans"
SET "code" = 'pro'
WHERE "uuid" = 'f2f81c47-6f7e-4df4-a20e-d15c8f4e6d4c';

CREATE UNIQUE INDEX "hotels_plans_code_key" ON "public"."hotels_plans"("code");
