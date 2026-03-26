import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { toUtcDateRange } from 'src/common/helpers/to-utc-date-range';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getInvoiceOrThrow(hotelUuid: string, invoiceUuid: string) {
    const invoice = await this.prisma.hotels_invoices_v2.findFirst({
      where: { uuid: invoiceUuid, hotel_uuid: hotelUuid },
    });

    if (!invoice) {
      throw new NotFoundException(`Invoice ${invoiceUuid} not found`);
    }

    return invoice;
  }

  async ensureInvoiceIsEditable(hotelUuid: string, invoiceUuid: string) {
    const invoice = await this.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    if (invoice.status === 'issued') {
      throw new BadRequestException(
        `Invoice ${invoiceUuid} cannot be modified because it is issued`,
      );
    }
    if (invoice.status === 'cancelled') {
      throw new BadRequestException(
        `Invoice ${invoiceUuid} cannot be modified because it is cancelled`,
      );
    }

    return invoice;
  }

  async findAll(options: {
    hotelUuid: string;
    timezone: string;
    page: number;
    limit: number;
    orderBy: string;
    order: string;
    from?: string;
    to?: string;
    search?: string;
    status?: string;
  }) {
    const {
      hotelUuid,
      timezone,
      page,
      limit,
      orderBy,
      order,
      from,
      to,
      search,
      status,
    } = options;

    const createdAt = toUtcDateRange(from, to, timezone);

    const searchTerm = search?.trim();
    const parsedInvoiceNumber =
      searchTerm && /^\d+$/.test(searchTerm) ? Number(searchTerm) : undefined;
    const invoiceNumberFilter =
      parsedInvoiceNumber !== undefined &&
      Number.isSafeInteger(parsedInvoiceNumber)
        ? [{ invoice_number: parsedInvoiceNumber }]
        : [];
    const searchFilter = searchTerm
      ? {
          OR: [
            ...invoiceNumberFilter,
            {
              notes: { contains: searchTerm, mode: 'insensitive' as const },
            },
            {
              customer: {
                full_name: {
                  contains: searchTerm,
                  mode: 'insensitive' as const,
                },
              },
            },
          ],
        }
      : undefined;
    const statusFilter = status ? { status } : undefined;
    const createdAtFilter = createdAt ? { created_at: createdAt } : undefined;

    const invoices = await this.prisma.hotels_invoices_v2.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...searchFilter,
        ...statusFilter,
        ...createdAtFilter,
      },
      include: {
        // items: { orderBy: { position: 'asc' } },
        // discounts: { orderBy: { created_at: 'asc' } },
        // taxes: { orderBy: { created_at: 'asc' } },
        // payments: {
        //   orderBy: { paid_at: 'desc' },
        //   include: { refunds: { orderBy: { created_at: 'desc' } } },
        // },
        customer: true,
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const hasMore = invoices.length === limit;
    return { data: invoices, hasMore };
  }

  async getSummary(options: {
    hotelUuid: string;
    timezone: string;
    from?: string;
    to?: string;
  }) {
    const { hotelUuid, timezone, from, to } = options;
    const createdAt = toUtcDateRange(from, to, timezone);
    const createdAtFilter = createdAt ? { created_at: createdAt } : undefined;

    const totals = await this.prisma.hotels_invoices_v2.aggregate({
      where: {
        hotel_uuid: hotelUuid,
        ...createdAtFilter,
      },
      _sum: {
        total: true,
        total_payments: true,
        total_refunds: true,
      },
      _count: true,
    });

    const totalInvoices = Number(totals._count ?? 0);
    const totalAmount = Number(totals._sum?.total ?? 0);
    const totalPayments = Number(totals._sum?.total_payments ?? 0);
    const totalRefunds = Number(totals._sum?.total_refunds ?? 0);
    const totalBalance = totalAmount - totalPayments + totalRefunds;

    return {
      data: { totalInvoices, totalAmount, totalPayments, totalBalance },
    };
  }

  async findOne(options: { hotelUuid: string; invoiceUuid: string }) {
    const hotelUuid = options.hotelUuid;
    const invoiceUuid = options.invoiceUuid;

    const invoice = await this.prisma.hotels_invoices_v2.findFirst({
      where: { uuid: invoiceUuid, hotel_uuid: hotelUuid },
      include: {
        items: { orderBy: { position: 'asc' } },
        discounts: { orderBy: { created_at: 'asc' } },
        taxes: { orderBy: { created_at: 'asc' } },
        payments: {
          orderBy: { paid_at: 'desc' },
          include: { refunds: { orderBy: { created_at: 'desc' } } },
        },
        customer: true,
      },
    });

    return { data: invoice };
  }

  async create(hotelUuid: string, authUserUuid: string, dto: CreateInvoiceDto) {
    this.logger.log(`Creating invoice for hotel ${hotelUuid}`);

    return this.prisma.hotels_invoices_v2.create({
      data: {
        hotel_uuid: hotelUuid,
        customer_uuid: dto.customer_uuid,
        // status: dto.status ?? 'draft',
        notes: dto.notes,
        created_by: authUserUuid,
      },
    });
  }

  async update(hotelUuid: string, invoiceUuid: string, dto: CreateInvoiceDto) {
    this.logger.log(`Updating invoice ${invoiceUuid} for hotel ${hotelUuid}`);

    await this.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.hotels_invoices_v2.update({
      where: { uuid: invoiceUuid },
      data: {
        ...(dto.customer_uuid !== undefined && {
          customer_uuid: dto.customer_uuid,
        }),
        // ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(hotelUuid: string, invoiceUuid: string) {
    this.logger.log(`Deleting invoice ${invoiceUuid} for hotel ${hotelUuid}`);
    await this.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);
    await this.prisma.hotels_invoices_v2.delete({
      where: { uuid: invoiceUuid },
    });
  }

  private resolveInvoiceStatus(
    currentStatus: string | undefined,
    total: number,
    totalPayments: number,
  ): string {
    const totalInCents = this.toCents(total);
    const totalPaymentsInCents = this.toCents(totalPayments);

    if (totalPaymentsInCents >= totalInCents) return 'paid';
    if (currentStatus === 'issued') return 'issued';
    return 'draft';
  }

  private toCents(value: number): number {
    return Math.round(value * 100);
  }

  async recalculateInvoice(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    invoiceUuid: string,
  ) {
    const [itemsAgg, discountsAgg, taxesAgg, paymentsAgg, refundsAgg, invoice] =
      await Promise.all([
        tx.hotels_invoices_items_v2.aggregate({
          where: { invoice_uuid: invoiceUuid },
          _sum: { total: true },
        }),
        tx.hotels_invoices_discounts_v2.aggregate({
          where: { invoice_uuid: invoiceUuid },
          _sum: { amount: true },
        }),
        tx.hotels_invoices_taxes_v2.aggregate({
          where: { invoice_uuid: invoiceUuid },
          _sum: { amount: true },
        }),
        tx.hotels_invoices_payments_v2.aggregate({
          where: {
            invoice_uuid: invoiceUuid,
            OR: [{ status: 'confirmed' }, { status: 'refunded' }],
          },
          _sum: { amount: true },
        }),
        tx.hotels_invoices_refunds_v2.aggregate({
          where: { invoice_uuid: invoiceUuid },
          _sum: { amount: true },
        }),
        tx.hotels_invoices_v2.findUnique({
          where: { uuid: invoiceUuid },
          select: { status: true },
        }),
      ]);

    const totalItems = Number(itemsAgg._sum.total ?? 0);
    const totalDiscounts = Number(discountsAgg._sum.amount ?? 0);
    const totalTaxes = Number(taxesAgg._sum.amount ?? 0);
    const total = totalItems - totalDiscounts + totalTaxes;
    const totalPayments = Number(paymentsAgg._sum.amount ?? 0);
    const totalRefunds = Number(refundsAgg._sum.amount ?? 0);
    const currentStatus = invoice?.status;
    const nextStatus = this.resolveInvoiceStatus(
      currentStatus,
      total,
      totalPayments,
    );

    await tx.hotels_invoices_v2.update({
      where: { uuid: invoiceUuid },
      data: {
        total_items: totalItems,
        total_discounts: totalDiscounts,
        total_taxes: totalTaxes,
        total,
        total_payments: totalPayments,
        total_refunds: totalRefunds,
        status: nextStatus,
      },
    });
  }

  async cancel(hotelUuid: string, invoiceUuid: string) {
    this.logger.log(`Cancelling invoice ${invoiceUuid} for hotel ${hotelUuid}`);
    await this.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);
    await this.prisma.hotels_invoices_v2.update({
      where: { uuid: invoiceUuid },
      data: { status: 'cancelled' },
    });
  }

  async reactivate(hotelUuid: string, invoiceUuid: string) {
    this.logger.log(`Activating invoice ${invoiceUuid} for hotel ${hotelUuid}`);
    await this.recalculateInvoice(this.prisma, invoiceUuid);
  }
}
