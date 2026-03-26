import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(options: {
    subscriptionUuid: string;
    page: number;
    limit: number;
  }) {
    const subscriptionUuid = options.subscriptionUuid;
    const page = options.page ?? 1;
    const limit = options.limit ?? 5;

    const invoices = await this.prisma.hotels_subscription_invoices.findMany({
      where: { subscription_uuid: subscriptionUuid },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const hasMore = invoices.length === limit;
    return { data: invoices, hasMore };
  }
}
