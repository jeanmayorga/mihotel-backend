import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(private readonly prisma: PrismaService) {}
  async findAll(options: {
    hotelUuid: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: string;
    search?: string;
  }) {
    const {
      hotelUuid,
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      order = 'desc',
      search,
    } = options;

    //customer search
    const searchCustomerFilter = search
      ? {
          full_name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        }
      : {};

    const customers = await this.prisma.hotels_customers.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...searchCustomerFilter,
      },
      orderBy: { [orderBy]: order },
      skip: (page - 1) * limit,
      take: limit,
    });
    const hasMore = customers.length === limit;

    return {
      data: customers,
      hasMore,
    };
  }

  async findOne(options: { customerUuid: string; hotelUuid: string }) {
    const { customerUuid, hotelUuid } = options;
    const customer = await this.prisma.hotels_customers.findUnique({
      where: {
        uuid: customerUuid,
        hotel_uuid: hotelUuid,
      },
    });

    return customer;
  }

  async create(options: { hotelUuid: string; payload: CreateCustomerDto }) {
    const { hotelUuid, payload } = options;
    const customer = await this.prisma.hotels_customers.create({
      data: {
        hotel_uuid: hotelUuid,
        ...payload,
      },
    });
    return customer;
  }

  async update(options: {
    hotelUuid: string;
    customerUuid: string;
    payload: UpdateCustomerDto;
  }) {
    const { hotelUuid, customerUuid, payload } = options;
    const customer = await this.prisma.hotels_customers.update({
      where: {
        uuid: customerUuid,
        hotel_uuid: hotelUuid,
      },
      data: payload,
    });
    return customer;
  }

  async delete(options: { customerUuid: string; hotelUuid: string }) {
    const { customerUuid, hotelUuid } = options;
    await this.prisma.hotels_customers.delete({
      where: {
        uuid: customerUuid,
        hotel_uuid: hotelUuid,
      },
    });
  }
}
