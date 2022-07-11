import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';
import { ProductsToCategoriesRepository } from './repositories/products-to-categories.repository';
import { ProductClientController } from './controllers/product-client.controller';
import { ProductAdminController } from './controllers/product-admin.controller';
import { ProductClientService } from './services/product-client.service';
import { ProductAdminService } from './services/product-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepository,
      ProductsToCategoriesRepository,
    ]),
  ],
  controllers: [ProductAdminController, ProductClientController],
  providers: [ProductAdminService, ProductClientService],
})
export class ProductModule {}
