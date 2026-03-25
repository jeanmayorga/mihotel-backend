import { Module } from '@nestjs/common';
import { UserHotelsModule } from '../user_hotels/user_hotels.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [UserHotelsModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
