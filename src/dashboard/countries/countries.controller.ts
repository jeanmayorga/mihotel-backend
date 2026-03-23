import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';
import { AuthRequiredGuard } from '../../common/guards/auth-required.guard';

@ApiTags('Dashboard / Countries')
@ApiBearerAuth()
@UseGuards(AuthRequiredGuard)
@Controller('dashboard/countries')
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
