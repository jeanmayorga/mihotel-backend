import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';

@Module({
  imports: [],
  controllers: [],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
