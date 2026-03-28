import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger';
import { AuthRequiredGuard } from 'src/common/guards/auth-required.guard';
import { AccountRequiredGuard } from 'src/common/guards/account-required.guard';
import { HotelUuid } from 'src/common/decorators/hotel-uuid.decorator';
import {
  CreateProductDto,
  GetProductsQueryDto,
  UpdateProductDto,
} from './products.dto';
import { ProductsService } from './products.service';

@ApiTags('Dashboard / Hotel Products')
@ApiBearerAuth()
@ApiParam({ name: 'hotelUuid', type: String })
@UseGuards(AuthRequiredGuard, AccountRequiredGuard)
@Controller('dashboard/hotels/:hotelUuid/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@HotelUuid() hotelUuid: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(hotelUuid, dto);
  }

  @Get()
  findAll(@HotelUuid() hotelUuid: string, @Query() query: GetProductsQueryDto) {
    return this.productsService.findAll(hotelUuid, query);
  }

  @Get(':productUuid')
  findOne(
    @HotelUuid() hotelUuid: string,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
  ) {
    return this.productsService.findOne(hotelUuid, productUuid);
  }

  @Patch(':productUuid')
  update(
    @HotelUuid() hotelUuid: string,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(hotelUuid, productUuid, dto);
  }

  @Delete(':productUuid')
  remove(
    @HotelUuid() hotelUuid: string,
    @Param('productUuid', ParseUUIDPipe) productUuid: string,
  ) {
    return this.productsService.remove(hotelUuid, productUuid);
  }
}
