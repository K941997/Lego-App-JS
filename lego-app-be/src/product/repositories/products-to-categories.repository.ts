import { EntityRepository, Repository } from 'typeorm';
import { ProductsToCategoriesEntity } from './../entities/products-to-categories.entity';

@EntityRepository(ProductsToCategoriesEntity) //!Repository không dùng được ở bản TypeOrm mới 0.3.0
export class ProductsToCategoriesRepository extends Repository<ProductsToCategoriesEntity> {}
