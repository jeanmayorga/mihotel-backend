import { Module } from '@nestjs/common';
import { DashboardHotelsModule } from './hotels/hotels.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { CountriesModule } from '../countries/countries.module';

@Module({
  imports: [DashboardHotelsModule, CountriesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
  // exports: [DashboardService],
})
export class DashboardModule {}
