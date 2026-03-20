import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InvoicesService } from './invoices.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addPayment(
    hotelUuid: string,
    invoiceUuid: string,
    authUserUuid: string,
    dto: CreatePaymentDto,
  ) {
    this.logger.log(`Adding payment to invoice ${invoiceUuid}`);
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.hotels_invoices_payments_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          amount: dto.amount,
          payment_method: dto.payment_method,
          status: dto.status ?? 'confirmed',
          notes: dto.notes,
          paid_at: dto.paid_at ?? new Date(),
          created_by: authUserUuid,
        },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return payment;
    });
  }

  async updatePayment(
    hotelUuid: string,
    invoiceUuid: string,
    paymentUuid: string,
    dto: Partial<CreatePaymentDto>,
  ) {
    this.logger.log(
      `Updating payment ${paymentUuid} in invoice ${invoiceUuid}`,
    );
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.hotels_invoices_payments_v2.update({
        where: { uuid: paymentUuid, invoice_uuid: invoiceUuid },
        data: {
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.payment_method !== undefined && {
            payment_method: dto.payment_method,
          }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.paid_at !== undefined && { paid_at: dto.paid_at }),
        },
      });

      if (dto.amount !== undefined) {
        await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      }

      return payment;
    });
  }

  async removePayment(
    hotelUuid: string,
    invoiceUuid: string,
    paymentUuid: string,
  ) {
    this.logger.log(
      `Removing payment ${paymentUuid} from invoice ${invoiceUuid}`,
    );
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_payments_v2.delete({
        where: { uuid: paymentUuid, invoice_uuid: invoiceUuid },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
