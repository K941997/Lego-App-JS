import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from '../dtos/admin/create-product.dto';
import { UpdateProductDto } from '../dtos/admin/update-product.dto';
import { ProductAdminService } from '../services/product-admin.service';
import { ProductEntity } from './../entities/product.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FindAllProductsAdminDto } from './../dtos/admin/find-all-products.dto';

@Controller('admin/product')
export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  @Post()
  async createProductAdmin(
    @Body() createProductDto: CreateProductDto,
  ): Promise<ProductEntity> {
    return this.productAdminService.createProductAdmin(createProductDto);
  }

  @Get()
  async findAllProductsAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() params: FindAllProductsAdminDto,
  ): Promise<Pagination<ProductEntity>> {
    limit = limit > 100 ? 100 : limit;

    return this.productAdminService.findAllProductsAdmin(
      { page, limit },
      params,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productAdminService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productAdminService.update(+id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productAdminService.remove(+id);
  }
}
