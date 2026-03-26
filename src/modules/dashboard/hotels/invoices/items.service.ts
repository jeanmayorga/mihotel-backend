import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { InvoicesService } from './invoices.service';
import { AddItemFromProductDto } from './dto/add-item-from-product.dto';

@Injectable()
export class ItemsService {
  private readonly logger = new Logger(ItemsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly invoicesService: InvoicesService,
  ) {}

  async addItem(hotelUuid: string, invoiceUuid: string, dto: CreateItemDto) {
    this.logger.log(`Adding item to invoice ${invoiceUuid}`);
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

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

  async addItemFromProduct(
    hotelUuid: string,
    invoiceUuid: string,
    dto: AddItemFromProductDto,
  ) {
    this.logger.log(
      `Adding product item ${dto.product_uuid} to invoice ${invoiceUuid}`,
    );
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      const product = await tx.hotels_products.findFirst({
        where: { uuid: dto.product_uuid, hotel_uuid: hotelUuid },
      });

      if (!product) {
        throw new NotFoundException(`Product ${dto.product_uuid} not found`);
      }

      if (!product.is_active) {
        throw new BadRequestException(
          `Product ${dto.product_uuid} is inactive and cannot be sold`,
        );
      }

      const itemCount = await tx.hotels_invoices_items_v2.count({
        where: { invoice_uuid: invoiceUuid },
      });

      const quantity = dto.quantity ?? 1;
      const unitPrice = dto.unit_price ?? Number(product.price);

      const item = await tx.hotels_invoices_items_v2.create({
        data: {
          invoice_uuid: invoiceUuid,
          description: dto.description ?? product.name,
          quantity,
          unit_price: unitPrice,
          total: quantity * unitPrice,
          position: itemCount,
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
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

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
    await this.invoicesService.ensureInvoiceIsEditable(hotelUuid, invoiceUuid);

    return this.prisma.$transaction(async (tx) => {
      await tx.hotels_invoices_items_v2.delete({
        where: { uuid: itemUuid, invoice_uuid: invoiceUuid },
      });

      await this.invoicesService.recalculateInvoice(tx, invoiceUuid);
    });
  }
}
