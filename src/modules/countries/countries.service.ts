import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.countries.findMany({
      orderBy: { name: 'asc' },
    });
  }

  findCitiesByCountry(countryUuid: string) {
    return this.prisma.cities.findMany({
      where: { country_uuid: countryUuid },
      orderBy: { name: 'asc' },
    });
  }
}
