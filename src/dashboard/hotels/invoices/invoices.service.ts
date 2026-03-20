import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

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

  async findAll(options: {
    hotelUuid: string;
    page: number;
    limit: number;
    orderBy: string;
    order: string;
    from?: string;
    to?: string;
    search?: string;
    status?: string;
  }) {
    const { hotelUuid, page, limit, orderBy, order, from, to, search, status } =
      options;

    const createdAt =
      from || to
        ? {
            ...(from ? { gte: new Date(`${from}T00:00:00.000Z`) } : {}),
            ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
          }
        : undefined;

    const searchTerm = search?.trim();
    const statusFilter = status ? { status } : undefined;

    const invoices = await this.prisma.hotels_invoices_v2.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...(createdAt ? { created_at: createdAt } : {}),
        ...statusFilter,
        ...(searchTerm
          ? {
              OR: [
                {
                  invoice_number: {
                    contains: searchTerm,
                    mode: 'insensitive',
                  },
                },
                {
                  notes: { contains: searchTerm, mode: 'insensitive' },
                },
                {
                  items: {
                    some: {
                      description: {
                        contains: searchTerm,
                        mode: 'insensitive',
                      },
                    },
                  },
                },
              ],
            }
          : {}),
      },
      include: {
        items: { orderBy: { position: 'asc' } },
        discounts: { orderBy: { created_at: 'asc' } },
        taxes: { orderBy: { created_at: 'asc' } },
        payments: { orderBy: { paid_at: 'desc' } },
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    const hasMore = invoices.length === limit;

    return { data: invoices, hasMore };
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
        refunds: { orderBy: { created_at: 'desc' } },
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
        invoice_number: dto.invoice_number,
        status: dto.status ?? 'draft',
        notes: dto.notes,
        created_by: authUserUuid,
      },
    });
  }

  async update(hotelUuid: string, invoiceUuid: string, dto: CreateInvoiceDto) {
    this.logger.log(`Updating invoice ${invoiceUuid} for hotel ${hotelUuid}`);

    await this.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.hotels_invoices_v2.update({
      where: { uuid: invoiceUuid },
      data: {
        ...(dto.customer_uuid !== undefined && {
          customer_uuid: dto.customer_uuid,
        }),
        ...(dto.invoice_number !== undefined && {
          invoice_number: dto.invoice_number,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(hotelUuid: string, invoiceUuid: string) {
    this.logger.log(`Deleting invoice ${invoiceUuid} for hotel ${hotelUuid}`);
    await this.getInvoiceOrThrow(hotelUuid, invoiceUuid);
    await this.prisma.hotels_invoices_v2.delete({
      where: { uuid: invoiceUuid },
    });
  }

  async recalculateInvoice(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    invoiceUuid: string,
  ) {
    const [itemsAgg, discountsAgg, taxesAgg, paymentsAgg, refundsAgg] =
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
          where: { invoice_uuid: invoiceUuid, status: 'confirmed' },
          _sum: { amount: true },
        }),
        tx.hotels_invoices_refunds_v2.aggregate({
          where: { invoice_uuid: invoiceUuid },
          _sum: { amount: true },
        }),
      ]);

    const totalItems = Number(itemsAgg._sum.total ?? 0);
    const totalDiscounts = Number(discountsAgg._sum.amount ?? 0);
    const totalTaxes = Number(taxesAgg._sum.amount ?? 0);
    const total = totalItems - totalDiscounts + totalTaxes;
    const totalPayments = Number(paymentsAgg._sum.amount ?? 0);
    const totalRefunds = Number(refundsAgg._sum.amount ?? 0);

    await tx.hotels_invoices_v2.update({
      where: { uuid: invoiceUuid },
      data: {
        total_items: totalItems,
        total_discounts: totalDiscounts,
        total_taxes: totalTaxes,
        total,
        total_payments: totalPayments,
        total_refunds: totalRefunds,
      },
    });
  }
}
