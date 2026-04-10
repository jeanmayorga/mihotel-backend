import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCustomerDto, UpdateCustomerDto } from './customers.dto';
import { startOfMonth, subMonths } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

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
    deleted?: boolean;
  }) {
    const {
      hotelUuid,
      page = 1,
      limit = 20,
      orderBy = 'created_at',
      order = 'desc',
      search,
      deleted = false,
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

    // deleted filter
    const deletedAtFilter = deleted
      ? { deleted_at: { not: null } }
      : { deleted_at: null };

    const customers = await this.prisma.hotels_customers.findMany({
      where: {
        hotel_uuid: hotelUuid,
        ...deletedAtFilter,
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
        deleted_at: null,
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
    const active = await this.prisma.hotels_customers.findFirst({
      where: {
        uuid: customerUuid,
        hotel_uuid: hotelUuid,
        deleted_at: null,
      },
      select: { uuid: true },
    });
    if (!active) {
      throw new NotFoundException('Customer not found');
    }
    return this.prisma.hotels_customers.update({
      where: { uuid: customerUuid },
      data: payload,
    });
  }

  async getSummary(options: { hotelUuid: string; hotelTimezone: string }) {
    const { hotelUuid, hotelTimezone } = options;

    const nowInHotelTz = toZonedTime(new Date(), hotelTimezone);
    const startOfThisMonth = fromZonedTime(
      startOfMonth(nowInHotelTz),
      hotelTimezone,
    );
    const startOfLastMonth = fromZonedTime(
      startOfMonth(subMonths(nowInHotelTz, 1)),
      hotelTimezone,
    );

    const [total, newThisMonth, newLastMonth, deleted] = await Promise.all([
      this.prisma.hotels_customers.count({
        where: { hotel_uuid: hotelUuid, deleted_at: null },
      }),
      this.prisma.hotels_customers.count({
        where: {
          hotel_uuid: hotelUuid,
          deleted_at: null,
          created_at: { gte: startOfThisMonth },
        },
      }),
      this.prisma.hotels_customers.count({
        where: {
          hotel_uuid: hotelUuid,
          deleted_at: null,
          created_at: { gte: startOfLastMonth, lt: startOfThisMonth },
        },
      }),
      this.prisma.hotels_customers.count({
        where: {
          hotel_uuid: hotelUuid,
          deleted_at: { not: null },
        },
      }),
    ]);

    return {
      total,
      new_this_month: newThisMonth,
      new_last_month: newLastMonth,
      deleted: deleted,
    };
  }

  async restore(options: { customerUuids: string[]; hotelUuid: string }) {
    const { customerUuids, hotelUuid } = options;
    const { count } = await this.prisma.hotels_customers.updateMany({
      where: {
        uuid: { in: customerUuids },
        hotel_uuid: hotelUuid,
        deleted_at: { not: null },
      },
      data: { deleted_at: null },
    });

    if (count === 0) {
      throw new NotFoundException('Some customers not found');
    }

    return { count };
  }

  async softDelete(options: { customerUuids: string[]; hotelUuid: string }) {
    const { customerUuids, hotelUuid } = options;
    const { count } = await this.prisma.hotels_customers.updateMany({
      where: {
        uuid: { in: customerUuids },
        hotel_uuid: hotelUuid,
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    });
    if (count === 0) {
      throw new BadRequestException('Some customers not found');
    }
    return { count };
  }

  async permanentDelete(options: {
    customerUuids: string[];
    hotelUuid: string;
  }) {
    const { customerUuids, hotelUuid } = options;
    const { count } = await this.prisma.hotels_customers.deleteMany({
      where: {
        uuid: { in: customerUuids },
        hotel_uuid: hotelUuid,
      },
    });
    if (count === 0) {
      throw new NotFoundException('Some customers not found');
    }
    return { count };
  }
}
