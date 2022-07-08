import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from './../../commons/entities/base.entity';
import { ProductsToCategoriesEntity } from './../../product/entities/products-to-categories.entity';

@Entity({ name: 'category' })
export class CategoryEntity extends BaseEntity {
  @PrimaryColumn()
  key: string;

  @Column()
  slug: string;

  @Column()
  name: string;

  @OneToMany(
    () => ProductsToCategoriesEntity,
    (productsToCategories) => productsToCategories.category,
    {
      cascade: ['insert'],
    },
  )
  productsToCategories: ProductsToCategoriesEntity[];
}
