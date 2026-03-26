import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  CreateProductDto,
  GetProductsQueryDto,
  UpdateProductDto,
} from './products.dto';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(private readonly prisma: PrismaService) {}

  create(hotelUuid: string, dto: CreateProductDto) {
    this.logger.log(`Creating product for hotel ${hotelUuid}`);

    return this.prisma.hotels_products.create({
      data: {
        hotel_uuid: hotelUuid,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll(hotelUuid: string, query: GetProductsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const orderBy = query.orderBy ?? 'created_at';
    const order = query.order ?? 'desc';
    const search = query.search?.trim();

    const products = await this.prisma.hotels_products.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...(query.is_active !== undefined && { is_active: query.is_active }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });

    const hasMore = products.length === limit;
    return { data: products, hasMore };
  }

  async findOne(hotelUuid: string, productUuid: string) {
    const product = await this.prisma.hotels_products.findFirst({
      where: { uuid: productUuid, hotel_uuid: hotelUuid },
    });

    if (!product) {
      throw new NotFoundException(`Product ${productUuid} not found`);
    }

    return product;
  }

  async update(hotelUuid: string, productUuid: string, dto: UpdateProductDto) {
    this.logger.log(`Updating product ${productUuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, productUuid);

    return this.prisma.hotels_products.update({
      where: { uuid: productUuid },
      data: dto,
    });
  }

  async remove(hotelUuid: string, productUuid: string) {
    this.logger.log(`Deleting product ${productUuid} for hotel ${hotelUuid}`);
    await this.findOne(hotelUuid, productUuid);

    return this.prisma.hotels_products.delete({
      where: { uuid: productUuid },
    });
  }
}
