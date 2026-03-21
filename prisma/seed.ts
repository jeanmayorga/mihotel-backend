import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const FREE_PLAN_UUID = '658d0214-1779-44f1-bc75-619477d6f838';
const BASIC_PLAN_UUID = '4bc8f54c-dda3-48c9-923d-eb089c60df2a';
const PRO_PLAN_UUID = 'f2f81c47-6f7e-4df4-a20e-d15c8f4e6d4c';

async function main() {
  await prisma.hotels_plans.upsert({
    where: { uuid: FREE_PLAN_UUID },
    update: { name: 'Free', price: 0, billing_cycle: 'monthly' },
    create: {
      uuid: FREE_PLAN_UUID,
      name: 'Free',
      price: 0,
      billing_cycle: 'monthly',
    },
  });

  await prisma.hotels_plans.upsert({
    where: { uuid: BASIC_PLAN_UUID },
    update: { name: 'Basic', price: 30, billing_cycle: 'monthly' },
    create: {
      uuid: BASIC_PLAN_UUID,
      name: 'Basic',
      price: 30,
      billing_cycle: 'monthly',
    },
  });

  await prisma.hotels_plans.upsert({
    where: { uuid: PRO_PLAN_UUID },
    update: { name: 'Pro', price: 80, billing_cycle: 'monthly' },
    create: {
      uuid: PRO_PLAN_UUID,
      name: 'Pro',
      price: 80,
      billing_cycle: 'monthly',
    },
  });

  console.log('Seeded plans: Free, Basic and Pro');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
