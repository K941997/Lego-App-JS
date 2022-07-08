import { EntityRepository, Repository } from 'typeorm';
import { ProductsToCategoriesEntity } from './../entities/products-to-categories.entity';

@EntityRepository(ProductsToCategoriesEntity)
export class ProductsToCategoriesRepository extends Repository<ProductsToCategoriesEntity> {}
