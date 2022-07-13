import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseArrayPipe,
} from '@nestjs/common';
import { CreateProductAdminDto } from '../dtos/admin/create-product-admin.dto';
import { UpdateProductAdminDto } from '../dtos/admin/update-product-admin.dto';
import { ProductAdminService } from '../services/product-admin.service';
import { ProductEntity } from './../entities/product.entity';
import { Pagination } from 'nestjs-typeorm-paginate';
import { FindAllProductsAdminDto } from '../dtos/admin/find-all-products-admin.dto';
import { FindOneProductAdminDto } from '../dtos/admin/find-one-product-admin.dto';

@Controller('admin/products')
export class ProductAdminController {
  constructor(private readonly productAdminService: ProductAdminService) {}

  //!CREATE Product Admin:
  @Post()
  async createProductAdmin(
    @Body() createProductAdminDto: CreateProductAdminDto,
  ): Promise<ProductEntity> {
    return this.productAdminService.createProductAdmin(createProductAdminDto);
  }

  //!GETALL Products Admin:
  @Get()
  async findAllProductsAdmin(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query() params: FindAllProductsAdminDto,
  ): Promise<Pagination<ProductEntity>> {
    limit = limit > 100 ? 100 : limit;

    return this.productAdminService.findAllProductsAdmin(
      {
        page,
        limit,
        route: `http://localhost:${process.env.PORT}/api/admin/products?`,
      }, //admin có thể không cần route, route cho SEO bên client
      params,
    );
  }

  //!GETONE Product Admin:
  @Get(':key')
  async findOneProductAdmin(
    @Param('key') key: string,
    @Query() params: FindOneProductAdminDto,
  ) {
    return this.productAdminService.findOneProductAdmin(key);
  }

  //!UPDATEONE Product Admin:
  @Patch(':key')
  async updateOneProductAdmin(
    @Param('key') key: string,
    @Body() updateProductAdminDto: UpdateProductAdminDto,
  ) {
    return this.productAdminService.updateOneProductAdmin(
      key,
      updateProductAdminDto,
    );
  }

  //!DELETEONE Product Admin:
  @Delete(':key')
  async deleteOneProductAdmin(@Param('key') key: string) {
    return this.productAdminService.deleteOneProductAdmin(key);
  }

  //!DELETEMULTI Products Admin:
  @Delete()
  async deleteMultiProductsAdmin(
    @Query('keys', ParseArrayPipe) keys: string[],
  ) {
    return this.productAdminService.deleteMultiProductsAdmin(keys);
  }
}
