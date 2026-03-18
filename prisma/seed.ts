import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const FREE_PLAN_UUID = '00000000-0000-0000-0000-000000000001';
const BASIC_PLAN_UUID = '00000000-0000-0000-0000-000000000002';

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

  console.log('Seeded plans: Free and Basic');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
