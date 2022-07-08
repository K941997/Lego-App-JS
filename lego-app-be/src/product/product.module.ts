import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';
import { ProductsToCategoriesRepository } from './repositories/products-to-categories.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductRepository,
      ProductsToCategoriesRepository,
    ]),
  ],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
