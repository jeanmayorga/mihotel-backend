import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';
import { InvoicesService } from './invoices.service';

@Injectable()
export class RefundsService {
  private readonly logger = new Logger(RefundsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addRefund(
    hotelUuid: string,
    invoiceUuid: string,
    authUserUuid: string,
    dto: CreateRefundDto,
  ) {
    this.logger.log(`Adding refund to invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    const payment = await this.prisma.hotels_invoices_payments_v2.findFirst({
      where: { uuid: dto.payment_uuid, invoice_uuid: invoiceUuid },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${dto.payment_uuid} not found`);
    }

    const totalRefunded = payment.refunds.reduce(
      (sum, r) => sum + Number(r.amount),
      0,
    );
    const available = Number(payment.amount) - totalRefunded;

    if (dto.amount > available) {
      throw new BadRequestException(
        `Refund amount (${dto.amount}) exceeds available amount (${available})`,
      );
    }

    const newTotalRefunded = totalRefunded + dto.amount;
    const paymentStatus =
      newTotalRefunded >= Number(payment.amount)
        ? 'refunded'
        : 'partially_refunded';

    return this.prisma.$transaction(async (tx) => {
      const refund = await tx.hotels_invoices_refunds_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          payment_uuid: dto.payment_uuid,
          amount: dto.amount,
          reason: dto.reason,
          created_by: authUserUuid,
        },
      });

      await tx.hotels_invoices_payments_v2.update({
        where: { uuid: dto.payment_uuid },
        data: { status: paymentStatus },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return refund;
    });
  }

  async removeRefund(
    hotelUuid: string,
    invoiceUuid: string,
    refundUuid: string,
  ) {
    this.logger.log(
      `Removing refund ${refundUuid} from invoice ${invoiceUuid}`,
    );
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    const refund = await this.prisma.hotels_invoices_refunds_v2.findFirst({
      where: { uuid: refundUuid, invoice_uuid: invoiceUuid },
    });

    if (!refund) {
      throw new NotFoundException(`Refund ${refundUuid} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_refunds_v2.delete({
        where: { uuid: refundUuid },
      });

      // Recalculate payment status
      const remainingRefunds = await tx.hotels_invoices_refunds_v2.findMany({
        where: { payment_uuid: refund.payment_uuid },
      });
      const totalRefunded = remainingRefunds.reduce(
        (sum, r) => sum + Number(r.amount),
        0,
      );

      const payment = await tx.hotels_invoices_payments_v2.findUniqueOrThrow({
        where: { uuid: refund.payment_uuid },
      });

      let paymentStatus = 'confirmed';
      if (totalRefunded >= Number(payment.amount)) {
        paymentStatus = 'refunded';
      } else if (totalRefunded > 0) {
        paymentStatus = 'partially_refunded';
      }

      await tx.hotels_invoices_payments_v2.update({
        where: { uuid: refund.payment_uuid },
        data: { status: paymentStatus },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
