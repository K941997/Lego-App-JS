import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductRepository } from './repositories/product.repository';
import { ProductsToCategoriesRepository } from './repositories/products-to-categories.repository';
import { ProductClientController } from './controllers/product-client.controller';
import { ProductAdminController } from './controllers/product-admin.controller';
import { ProductClientService } from './services/product-client.service';
import { ProductAdminService } from './services/product-admin.service';
// import { productProvider } from './repositories/providers/product.provider';
import { ProductEntity } from './entities/product.entity';
import { ProductsToCategoriesEntity } from './entities/products-to-categories.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { CategoryRepository } from './../category/repositories/category.repository';

// import { TypeOrmExModule } from '../typeorm-repository/typeorm-ex.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // ProductRepository, //!Repository (Không dùng được ở TypeOrm 0.3.0)
      // ProductsToCategoriesRepository,
      // CategoryRepository,
      ProductEntity,
      ProductsToCategoriesEntity,
      CategoryEntity,
    ]),
    // TypeOrmExModule.forCustomRepository([ProductRepository]), //!Custom Repository (Không dùng được ở TypeOrm 0.3.0)
  ],

  controllers: [ProductAdminController, ProductClientController],
  providers: [ProductAdminService, ProductClientService],
})
export class ProductModule {}
