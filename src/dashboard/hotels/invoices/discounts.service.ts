import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { InvoicesService } from './invoices.service';

@Injectable()
export class DiscountsService {
  private readonly logger = new Logger(DiscountsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addDiscount(
    hotelUuid: string,
    invoiceUuid: string,
    authUserUuid: string,
    dto: CreateDiscountDto,
  ) {
    this.logger.log(`Adding discount to invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const discount = await tx.hotels_invoices_discounts_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          description: dto.description,
          amount: dto.amount,
          created_by: authUserUuid,
        },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return discount;
    });
  }

  async updateDiscount(
    hotelUuid: string,
    invoiceUuid: string,
    discountUuid: string,
    dto: Partial<CreateDiscountDto>,
  ) {
    this.logger.log(
      `Updating discount ${discountUuid} in invoice ${invoiceUuid}`,
    );
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const discount = await tx.hotels_invoices_discounts_v2.update({
        where: { uuid: discountUuid, invoice_uuid: invoiceUuid },
        data: {
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
        },
      });

      if (dto.amount !== undefined) {
        await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      }

      return discount;
    });
  }

  async removeDiscount(
    hotelUuid: string,
    invoiceUuid: string,
    discountUuid: string,
  ) {
    this.logger.log(
      `Removing discount ${discountUuid} from invoice ${invoiceUuid}`,
    );
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_discounts_v2.delete({
        where: { uuid: discountUuid, invoice_uuid: invoiceUuid },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
