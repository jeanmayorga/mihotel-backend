import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { InvoicesService } from './invoices.service';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addItem(hotelUuid: string, invoiceUuid: string, dto: CreateItemDto) {
    this.logger.log(`Adding item to invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const itemCount = await tx.hotels_invoices_items_v2.count({
        where: { invoice_uuid: invoiceUuid },
      });

      const item = await tx.hotels_invoices_items_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          description: dto.description,
          quantity: dto.quantity ?? 1,
          unit_price: dto.unit_price,
          total: (dto.quantity ?? 1) * dto.unit_price,
          position: dto.position ?? itemCount,
        },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return item;
    });
  }

  async updateItem(
    hotelUuid: string,
    invoiceUuid: string,
    itemUuid: string,
    dto: Partial<CreateItemDto>,
  ) {
    this.logger.log(`Updating item ${itemUuid} in invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    const current = await this.prisma.hotels_invoices_items_v2.findFirst({
      where: { uuid: itemUuid, invoice_uuid: invoiceUuid },
    });

    if (!current) {
      throw new NotFoundException(`Item ${itemUuid} not found`);
    }

    const newQuantity = dto.quantity ?? Number(current.quantity);
    const newUnitPrice = dto.unit_price ?? Number(current.unit_price);

    return this.prisma.$transaction(async (tx) => {
      const item = await tx.hotels_invoices_items_v2.update({
        where: { uuid: itemUuid },
        data: {
          ...(dto.description !== undefined && {
            description: dto.description,
          }),
          ...(dto.quantity !== undefined && { quantity: dto.quantity }),
          ...(dto.unit_price !== undefined && { unit_price: dto.unit_price }),
          ...(dto.position !== undefined && { position: dto.position }),
          total: newQuantity * newUnitPrice,
        },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
      return item;
    });
  }

  async removeItem(hotelUuid: string, invoiceUuid: string, itemUuid: string) {
    this.logger.log(`Removing item ${itemUuid} from invoice ${invoiceUuid}`);
    await this.invoicesService.getInvoiceOrThrow(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_items_v2.delete({
        where: { uuid: itemUuid, invoice_uuid: invoiceUuid },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
