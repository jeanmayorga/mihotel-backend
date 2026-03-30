/**
 * Migración: mueve datos de las tablas v1 a las tablas v2.
 *
 * Tablas origen:
 *   - hotels_reservations → hotels_reservations_v2
 *   - hotels_reservations_rooms → hotels_reservations_rooms_v2
 *   - hotels_invoices → hotels_invoices_v2
 *   - hotels_invoices_items → hotels_invoices_items_v2
 *   - hotels_invoices_payments → hotels_invoices_payments_v2
 *
 * Cómo correr:
 *   bun run scripts/migrate-v1-to-v2.ts
 *
 * Flags:
 *   --dry-run  Solo muestra lo que haría, sin insertar nada
 *   --clean-v2 Limpia tablas v2 antes de migrar
 */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('Falta variable de entorno: DATABASE_URL');
  process.exit(1);
}

const dryRun = process.argv.includes('--dry-run');
const cleanV2 = process.argv.includes('--clean-v2');

const prisma: PrismaClient = new PrismaClient({
  adapter: new PrismaPg({ connectionString: DATABASE_URL }),
});

/**
 * El cliente generado incluye `@ts-nocheck`; con type-aware ESLint el delegado a veces
 * queda como tipo `error` → `no-unsafe-call`. Estas funciones fijan firmas concretas.
 * (Usamos shapes locales en vez de `Prisma.*` para que el IDE no marque tipos no resueltos.)
 */
type InvoiceDiscountV2CreateData = {
  invoice_uuid: string;
  description: string;
  amount: number;
  created_at: Date;
};

type InvoiceTaxV2CreateData = {
  invoice_uuid: string;
  name: string;
  amount: number;
  created_at: Date;
};

type InvoiceRefundV2CreateData = {
  invoice_uuid: string;
  payment_uuid: string;
  amount: unknown;
  reason: string;
  created_at: Date;
};

function invoiceDiscountsV2(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_invoices_discounts_v2: {
        deleteMany: () => Promise<{ count: number }>;
        create: (args: {
          data: InvoiceDiscountV2CreateData;
        }) => Promise<unknown>;
      };
    }
  ).hotels_invoices_discounts_v2;
}

function invoiceTaxesV2(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_invoices_taxes_v2: {
        deleteMany: () => Promise<{ count: number }>;
        create: (args: { data: InvoiceTaxV2CreateData }) => Promise<unknown>;
      };
    }
  ).hotels_invoices_taxes_v2;
}

function invoiceRefundsV2(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_invoices_refunds_v2: {
        deleteMany: () => Promise<{ count: number }>;
        findFirst: (args: {
          where: { payment_uuid: string };
        }) => Promise<unknown>;
        create: (args: { data: InvoiceRefundV2CreateData }) => Promise<unknown>;
        aggregate: (args: {
          where: { invoice_uuid: string };
          _sum: { amount: true };
        }) => Promise<{ _sum: { amount: unknown } }>;
      };
    }
  ).hotels_invoices_refunds_v2;
}

function invoicePaymentsV2(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_invoices_payments_v2: {
        update: (args: {
          where: { uuid: string };
          data: { status: string };
        }) => Promise<unknown>;
      };
    }
  ).hotels_invoices_payments_v2;
}

function invoicesV2(client: PrismaClient) {
  return (
    client as unknown as {
      hotels_invoices_v2: {
        update: (args: {
          where: { uuid: string };
          data: { total_refunds: number };
        }) => Promise<unknown>;
      };
    }
  ).hotels_invoices_v2;
}

async function cleanV2Tables() {
  console.log('\n=== Limpiando tablas v2 ===');

  const counts = {
    reservationsRooms: await prisma.hotels_reservations_rooms_v2.count(),
    reservations: await prisma.hotels_reservations_v2.count(),
    refunds: await prisma.hotels_invoices_refunds_v2.count(),
    payments: await prisma.hotels_invoices_payments_v2.count(),
    items: await prisma.hotels_invoices_items_v2.count(),
    discounts: await prisma.hotels_invoices_discounts_v2.count(),
    taxes: await prisma.hotels_invoices_taxes_v2.count(),
    invoices: await prisma.hotels_invoices_v2.count(),
  };

  console.log('  Registros actuales en v2:');
  console.log(`    reservations_rooms_v2: ${counts.reservationsRooms}`);
  console.log(`    reservations_v2: ${counts.reservations}`);
  console.log(`    invoices_refunds_v2: ${counts.refunds}`);
  console.log(`    invoices_payments_v2: ${counts.payments}`);
  console.log(`    invoices_items_v2: ${counts.items}`);
  console.log(`    invoices_discounts_v2: ${counts.discounts}`);
  console.log(`    invoices_taxes_v2: ${counts.taxes}`);
  console.log(`    invoices_v2: ${counts.invoices}`);

  if (dryRun) {
    console.log('  DRY RUN: no se eliminará nada');
    return;
  }

  // Orden importante por llaves foráneas (hijos -> padres).
  const deletedReservationsRooms =
    await prisma.hotels_reservations_rooms_v2.deleteMany();
  const deletedReservations = await prisma.hotels_reservations_v2.deleteMany();
  const deletedRefunds = await invoiceRefundsV2(prisma).deleteMany();
  const deletedPayments = await prisma.hotels_invoices_payments_v2.deleteMany();
  const deletedItems = await prisma.hotels_invoices_items_v2.deleteMany();
  const deletedDiscounts = await invoiceDiscountsV2(prisma).deleteMany();
  const deletedTaxes = await invoiceTaxesV2(prisma).deleteMany();
  const deletedInvoices = await prisma.hotels_invoices_v2.deleteMany();

  console.log('  ✓ Limpieza completada:');
  console.log(
    `    reservations_rooms_v2 eliminados: ${deletedReservationsRooms.count}`,
  );
  console.log(`    reservations_v2 eliminados: ${deletedReservations.count}`);
  console.log(`    invoices_refunds_v2 eliminados: ${deletedRefunds.count}`);
  console.log(`    invoices_payments_v2 eliminados: ${deletedPayments.count}`);
  console.log(`    invoices_items_v2 eliminados: ${deletedItems.count}`);
  console.log(
    `    invoices_discounts_v2 eliminados: ${deletedDiscounts.count}`,
  );
  console.log(`    invoices_taxes_v2 eliminados: ${deletedTaxes.count}`);
  console.log(`    invoices_v2 eliminados: ${deletedInvoices.count}`);
}

async function migrateReservations() {
  console.log('\n=== Migrando Reservaciones ===');

  console.log('  Cargando reservaciones v1...');
  const v1Reservations = await prisma.hotels_reservations.findMany({
    where: { hotel_uuid: { not: null } },
    include: {
      hotels_reservations_rooms: true,
      hotels_rooms: true,
    },
  });

  console.log('  Cargando reservaciones v2 existentes...');
  const existingV2Uuids = new Set(
    (
      await prisma.hotels_reservations_v2.findMany({
        select: { uuid: true },
      })
    ).map((r) => r.uuid),
  );

  const toMigrate = v1Reservations.filter((r) => !existingV2Uuids.has(r.uuid));

  console.log(
    `  Reservaciones v1: ${v1Reservations.length}, ya en v2: ${existingV2Uuids.size}, por migrar: ${toMigrate.length}`,
  );

  if (dryRun || toMigrate.length === 0) return;

  let reservationsCreated = 0;
  let roomsCreated = 0;
  let roomsSkipped = 0;

  for (const r of toMigrate) {
    console.log(
      `  [${reservationsCreated + 1}/${toMigrate.length}] Migrando reservación ${r.uuid} (hotel: ${r.hotel_uuid}, status: ${r.status})`,
    );

    await prisma.hotels_reservations_v2.create({
      data: {
        uuid: r.uuid,
        hotel_uuid: r.hotel_uuid!,
        customer_uuid: r.customer_uuid,
        source: 'direct',
        notes: r.notes,
        created_at: r.created_at,
      },
    });
    reservationsCreated++;

    // Si tiene room_uuid directo en la reservación (v1 legacy)
    if (r.room_uuid) {
      const alreadyLinked = await prisma.hotels_reservations_rooms_v2.findFirst(
        {
          where: {
            reservation_uuid: r.uuid,
            room_uuid: r.room_uuid,
          },
        },
      );

      if (!alreadyLinked) {
        console.log(
          `    + Room directo: ${r.room_uuid} (precio: ${r.hotels_rooms?.price ?? 0})`,
        );
        await prisma.hotels_reservations_rooms_v2.create({
          data: {
            reservation_uuid: r.uuid,
            room_uuid: r.room_uuid,
            check_in_date: r.check_in_date,
            check_out_date: r.check_out_date,
            status: mapReservationStatus(r.status),
            adults_count: r.adults_count ? Number(r.adults_count) : 1,
            children_count: r.children_count ? Number(r.children_count) : 0,
            babies_count: r.babies_count ? Number(r.babies_count) : 0,
            price_per_night: r.hotels_rooms?.price ?? 0,
            created_at: r.created_at,
          },
        });
        roomsCreated++;
      } else {
        console.log(`    = Room directo ${r.room_uuid} ya existe, saltando`);
        roomsSkipped++;
      }
    }

    // Rooms de la tabla pivot v1
    for (const room of r.hotels_reservations_rooms) {
      if (!room.room_uuid || !room.reservation_uuid) continue;

      const alreadyLinked = await prisma.hotels_reservations_rooms_v2.findFirst(
        {
          where: {
            reservation_uuid: room.reservation_uuid,
            room_uuid: room.room_uuid,
          },
        },
      );

      if (!alreadyLinked) {
        const roomData = await prisma.hotels_rooms.findFirst({
          where: { uuid: room.room_uuid },
          select: { price: true },
        });

        console.log(
          `    + Room pivot: ${room.room_uuid} (precio: ${roomData?.price ?? 0})`,
        );
        await prisma.hotels_reservations_rooms_v2.create({
          data: {
            reservation_uuid: room.reservation_uuid,
            room_uuid: room.room_uuid,
            check_in_date: r.check_in_date,
            check_out_date: r.check_out_date,
            status: mapReservationStatus(r.status),
            adults_count: r.adults_count ? Number(r.adults_count) : 1,
            children_count: r.children_count ? Number(r.children_count) : 0,
            babies_count: r.babies_count ? Number(r.babies_count) : 0,
            price_per_night: roomData?.price ?? 0,
            created_at: r.created_at,
          },
        });
        roomsCreated++;
      } else {
        console.log(`    = Room pivot ${room.room_uuid} ya existe, saltando`);
        roomsSkipped++;
      }
    }
  }

  console.log(
    `  ✓ Reservaciones creadas: ${reservationsCreated}, Rooms creados: ${roomsCreated}, Rooms saltados: ${roomsSkipped}`,
  );
}

async function migrateInvoices() {
  console.log('\n=== Migrando Invoices ===');

  console.log('  Cargando invoices v1...');
  const v1Invoices = await prisma.hotels_invoices.findMany({
    include: {
      hotels_invoices_items: true,
      hotels_invoices_payments: true,
      hotels_reservations: true,
    },
  });

  console.log('  Cargando invoices v2 existentes...');
  const existingV2Uuids = new Set(
    (
      await prisma.hotels_invoices_v2.findMany({
        select: { uuid: true },
      })
    ).map((i) => i.uuid),
  );

  const toMigrate = v1Invoices.filter((i) => !existingV2Uuids.has(i.uuid));

  // Contar payments que ya existen en v2 para invoices ya migradas
  const existingV2PaymentCount =
    await prisma.hotels_invoices_payments_v2.count();

  console.log(
    `  Invoices v1: ${v1Invoices.length}, ya en v2: ${existingV2Uuids.size}, por migrar: ${toMigrate.length}`,
  );
  console.log(`  Payments v2 existentes: ${existingV2PaymentCount}`);

  // Para invoices ya migradas, verificar si faltan payments
  let missingPayments = 0;
  for (const inv of v1Invoices.filter((i) => existingV2Uuids.has(i.uuid))) {
    for (const payment of inv.hotels_invoices_payments) {
      if (!payment.invoice_uuid) continue;
      const exists = await prisma.hotels_invoices_payments_v2.findFirst({
        where: {
          invoice_uuid: inv.uuid,
          paid_at: payment.created_at,
          amount: payment.amount ?? 0,
        },
      });
      if (!exists) {
        missingPayments++;
        if (!dryRun) {
          console.log(
            `  + Payment faltante para invoice ${inv.uuid}: $${payment.amount} (${payment.payment_method})`,
          );
          await prisma.hotels_invoices_payments_v2.create({
            data: {
              invoice_uuid: inv.uuid,
              amount: payment.amount ?? 0,
              payment_method: payment.payment_method ?? 'cash',
              status: 'confirmed',
              notes: null,
              paid_at: payment.created_at,
              created_at: payment.created_at,
            },
          });
        }
      }
    }
  }
  if (missingPayments > 0) {
    console.log(`  ✓ Payments faltantes recuperados: ${missingPayments}`);
  }

  if (dryRun && toMigrate.length === 0) return;
  if (toMigrate.length === 0) return;

  let invoicesCreated = 0;
  let invoicesSkipped = 0;
  let itemsCreated = 0;
  let paymentsCreated = 0;
  let discountsCreated = 0;
  let taxesCreated = 0;
  let reservationsLinked = 0;

  for (const inv of toMigrate) {
    const hotelUuid = inv.hotels_reservations?.hotel_uuid;
    if (!hotelUuid) {
      console.log(
        `  ⚠ Invoice ${inv.uuid} sin hotel_uuid (no tiene reservación). Saltando.`,
      );
      invoicesSkipped++;
      continue;
    }

    const totalItems = inv.hotels_invoices_items.reduce(
      (sum, item) => sum + (item.amount ?? 0),
      0,
    );
    const totalPayments = inv.hotels_invoices_payments.reduce(
      (sum, p) => sum + (p.amount ?? 0),
      0,
    );
    const discountTotal = inv.discount_total ?? 0;
    const taxTotal = inv.tax_total ?? 0;
    const total = totalItems - discountTotal + taxTotal;
    const status = totalPayments >= total && total > 0 ? 'paid' : 'draft';

    console.log(
      `  [${invoicesCreated + 1}/${toMigrate.length}] Invoice ${inv.uuid} (${inv.invoice_number}) — items: ${inv.hotels_invoices_items.length}, payments: ${inv.hotels_invoices_payments.length}, total: $${total}, status: ${status}`,
    );

    if (dryRun) {
      invoicesCreated++;
      continue;
    }

    await prisma.hotels_invoices_v2.create({
      data: {
        uuid: inv.uuid,
        hotel_uuid: hotelUuid,
        customer_uuid: inv.customer_uuid,
        // invoice_number: invoiceNumber,
        status,
        total_items: totalItems,
        total_discounts: discountTotal,
        total_taxes: taxTotal,
        total,
        total_payments: totalPayments,
        total_refunds: 0,
        notes: null,
        created_at: inv.created_at,
      },
    });
    invoicesCreated++;

    // Migrar items
    for (let index = 0; index < inv.hotels_invoices_items.length; index++) {
      const item = inv.hotels_invoices_items[index];
      if (!item.invoice_uuid) continue;

      console.log(
        `    + Item: "${item.description ?? 'sin descripción'}" $${item.amount ?? 0}`,
      );
      await prisma.hotels_invoices_items_v2.create({
        data: {
          invoice_uuid: inv.uuid,
          description: item.description ?? 'Item migrado',
          quantity: 1,
          unit_price: item.amount ?? 0,
          total: item.amount ?? 0,
          position: index,
          created_at: item.created_at,
        },
      });
      itemsCreated++;
    }

    // Migrar payments
    for (const payment of inv.hotels_invoices_payments) {
      if (!payment.invoice_uuid) continue;

      console.log(
        `    + Payment: $${payment.amount ?? 0} (${payment.payment_method ?? 'cash'})`,
      );
      await prisma.hotels_invoices_payments_v2.create({
        data: {
          invoice_uuid: inv.uuid,
          amount: payment.amount ?? 0,
          payment_method: payment.payment_method ?? 'cash',
          status: 'confirmed',
          notes: null,
          paid_at: payment.created_at,
          created_at: payment.created_at,
        },
      });
      paymentsCreated++;
    }

    // Migrar discounts
    if (discountTotal > 0) {
      console.log(
        `    + Discount: $${discountTotal} (${inv.discount_comment ?? 'sin comentario'})`,
      );
      const discountData: InvoiceDiscountV2CreateData = {
        invoice_uuid: inv.uuid,
        description: inv.discount_comment ?? 'Descuento migrado',
        amount: discountTotal,
        created_at: inv.created_at,
      };
      await invoiceDiscountsV2(prisma).create({
        data: discountData,
      });
      discountsCreated++;
    }

    // Migrar taxes
    if (taxTotal > 0) {
      console.log(`    + Tax: $${taxTotal} (${inv.tax_comment ?? 'IVA'})`);
      const taxData: InvoiceTaxV2CreateData = {
        invoice_uuid: inv.uuid,
        name: inv.tax_comment ?? 'IVA',
        amount: taxTotal,
        created_at: inv.created_at,
      };
      await invoiceTaxesV2(prisma).create({ data: taxData });
      taxesCreated++;
    }

    // Ligar reservación con invoice
    if (inv.reservation_uuid) {
      await prisma.hotels_reservations_v2
        .update({
          where: { uuid: inv.reservation_uuid },
          data: { invoice_uuid: inv.uuid },
        })
        .then(() => {
          console.log(
            `    → Reservación ${inv.reservation_uuid} ligada a invoice`,
          );
          reservationsLinked++;
        })
        .catch(() => {
          console.log(
            `    ⚠ No se pudo ligar invoice con reservación ${inv.reservation_uuid}`,
          );
        });
    }
  }

  console.log(`\n  Resumen Invoices:`);
  console.log(`    Invoices creadas: ${invoicesCreated}`);
  console.log(`    Invoices saltadas: ${invoicesSkipped}`);
  console.log(`    Items creados: ${itemsCreated}`);
  console.log(`    Payments creados: ${paymentsCreated}`);
  console.log(`    Discounts creados: ${discountsCreated}`);
  console.log(`    Taxes creados: ${taxesCreated}`);
  console.log(`    Reservaciones ligadas: ${reservationsLinked}`);
}

async function migrateRefunds() {
  console.log(
    '\n=== Migrando Refunds (reservaciones con status "refunded") ===',
  );

  // Buscar reservaciones v1 con status refunded
  const refundedReservations = await prisma.hotels_reservations.findMany({
    where: { status: 'refunded' },
    include: {
      hotels_invoices: {
        include: { hotels_invoices_payments: true },
      },
    },
  });

  console.log(
    `  Reservaciones con status "refunded": ${refundedReservations.length}`,
  );

  if (refundedReservations.length === 0) return;

  let refundsCreated = 0;
  let paymentsUpdated = 0;
  let roomsUpdated = 0;
  let skipped = 0;

  for (const reservation of refundedReservations) {
    console.log(
      `  Reservación ${reservation.uuid} — invoices: ${reservation.hotels_invoices.length}`,
    );

    // Actualizar status de rooms en v2 a cancelled
    const v2Rooms = await prisma.hotels_reservations_rooms_v2.findMany({
      where: { reservation_uuid: reservation.uuid },
    });

    for (const room of v2Rooms) {
      if (room.status !== 'cancelled') {
        if (!dryRun) {
          await prisma.hotels_reservations_rooms_v2.update({
            where: { uuid: room.uuid },
            data: {
              status: 'cancelled',
              cancelled_at: reservation.created_at,
            },
          });
        }
        console.log(`    → Room ${room.uuid} status → cancelled`);
        roomsUpdated++;
      }
    }

    // Para cada invoice de la reservación, crear refunds por cada payment
    for (const invoice of reservation.hotels_invoices) {
      // Buscar payments v2 de esta invoice
      const v2Payments = await prisma.hotels_invoices_payments_v2.findMany({
        where: { invoice_uuid: invoice.uuid },
      });

      if (v2Payments.length === 0) {
        console.log(
          `    ⚠ Invoice ${invoice.uuid} sin payments en v2, saltando`,
        );
        skipped++;
        continue;
      }

      for (const payment of v2Payments) {
        // Verificar si ya existe un refund para este payment
        const existingRefund = await invoiceRefundsV2(prisma).findFirst({
          where: { payment_uuid: payment.uuid },
        });

        if (existingRefund) {
          console.log(
            `    = Refund ya existe para payment ${payment.uuid}, saltando`,
          );
          skipped++;
          continue;
        }

        if (!dryRun) {
          // Crear refund por el total del payment
          await invoiceRefundsV2(prisma).create({
            data: {
              invoice_uuid: invoice.uuid,
              payment_uuid: payment.uuid,
              amount: payment.amount,
              reason: 'Refund migrado — reservación con status refunded',
              created_at: reservation.created_at,
            },
          });

          // Actualizar status del payment a refunded
          await invoicePaymentsV2(prisma).update({
            where: { uuid: payment.uuid },
            data: { status: 'refunded' },
          });

          // Actualizar totales de la invoice
          const refundsAgg = await invoiceRefundsV2(prisma).aggregate({
            where: { invoice_uuid: invoice.uuid },
            _sum: { amount: true },
          });

          await invoicesV2(prisma).update({
            where: { uuid: invoice.uuid },
            data: {
              total_refunds: Number(refundsAgg._sum.amount ?? 0),
            },
          });
        }

        console.log(
          `    + Refund: payment ${payment.uuid} → $${Number(payment.amount ?? 0)} (status → refunded)`,
        );
        refundsCreated++;
        paymentsUpdated++;
      }
    }
  }

  console.log(`\n  Resumen Refunds:`);
  console.log(`    Refunds creados: ${refundsCreated}`);
  console.log(`    Payments actualizados a refunded: ${paymentsUpdated}`);
  console.log(`    Rooms actualizados a cancelled: ${roomsUpdated}`);
  console.log(`    Saltados: ${skipped}`);
}

function mapReservationStatus(v1Status: string | null): string {
  switch (v1Status) {
    case 'confirmed':
      return 'confirmed';
    case 'checked-in':
      return 'checked_in';
    case 'checked-out':
      return 'checked_out';
    case 'canceled':
    case 'cancelled':
      return 'cancelled';
    case 'no-show':
      return 'cancelled';
    case 'refunded':
      return 'cancelled';
    default:
      return 'pending';
  }
}

async function main() {
  console.log(
    dryRun ? '🔍 DRY RUN — no se insertará nada\n' : '🚀 Iniciando migración\n',
  );

  try {
    if (cleanV2) {
      await cleanV2Tables();
    }
    await migrateReservations();
    await migrateInvoices();
    await migrateRefunds();
    console.log('\n✅ Migración completada');
  } catch (error) {
    console.error('\n❌ Error en migración:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
