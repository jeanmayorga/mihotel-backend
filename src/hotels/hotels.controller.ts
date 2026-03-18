import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { HotelsService } from './hotels.service';
import { GetHotelsQueryDto } from './dto/get-hotels-query.dto';

@ApiTags('Hotels')
@Public()
@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  findAll(@Query() query: GetHotelsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sortBy = query.sortBy ?? 'created_at';
    const sortOrder = query.sortOrder ?? 'desc';
    const disabled = query.disabled ?? false;

    return this.hotelsService.findAll({
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
      disabled,
    });
  }
}
