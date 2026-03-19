import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { InvoicesService } from './invoices.service';

@Injectable()
export class TaxesService {
  private readonly logger = new Logger(TaxesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addTax(
    hotelUuid: string,
    invoiceUuid: string,
    authUserUuid: string,
    dto: CreateTaxDto,
  ) {
    this.logger.log(`Adding tax to invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const tax = await tx.hotels_invoices_taxes_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          name: dto.name,
          amount: dto.amount,
          created_by: authUserUuid,
        },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return tax;
    });
  }

  async updateTax(
    hotelUuid: string,
    invoiceUuid: string,
    taxUuid: string,
    dto: Partial<CreateTaxDto>,
  ) {
    this.logger.log(`Updating tax ${taxUuid} in invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const tax = await tx.hotels_invoices_taxes_v2.update({
        where: { uuid: taxUuid, invoice_uuid: invoiceUuid },
        data: {
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
        },
      });

      if (dto.amount !== undefined) {
        await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      }

      return tax;
    });
  }

  async removeTax(hotelUuid: string, invoiceUuid: string, taxUuid: string) {
    this.logger.log(`Removing tax ${taxUuid} from invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_taxes_v2.delete({
        where: { uuid: taxUuid, invoice_uuid: invoiceUuid },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
