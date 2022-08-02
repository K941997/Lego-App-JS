import { EntityRepository, Repository, DataSource } from 'typeorm';
import { ProductsToCategoriesEntity } from './../entities/products-to-categories.entity';
import { Injectable } from '@nestjs/common';

// @EntityRepository(ProductsToCategoriesEntity) //!Repository Custom 0.2 (Can't Use)
// export class ProductsToCategoriesRepository extends Repository<ProductsToCategoriesEntity> {}

@Injectable()
export class ProductsToCategoriesRepository extends Repository<ProductsToCategoriesEntity> {
  //!Repository Custom TypeOrm 0.3:
  constructor(private dataSource: DataSource) {
    super(ProductsToCategoriesEntity, dataSource.createEntityManager());
  }
}
