import { Module } from '@nestjs/common';
import { PublicHotelsModule } from './hotels/hotels.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [HealthModule, PublicHotelsModule],
})
export class PublicModule {}
