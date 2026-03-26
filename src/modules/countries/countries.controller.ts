import { Controller, Get, Param } from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  async findAll() {
    const countries = await this.countriesService.findAll();
    return { data: countries };
  }

  @Get(':countryUuid/cities')
  @ApiParam({ name: 'countryUuid', type: String })
  async findCities(@Param('countryUuid') countryUuid: string) {
    const cities = await this.countriesService.findCitiesByCountry(countryUuid);
    return { data: cities };
  }
}
