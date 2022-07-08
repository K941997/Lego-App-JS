import { BaseEntity } from '../../commons/entities/base.entity';
import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BooleanEnum } from '../../commons/constants/global.constant';
import { ProductsToCategoriesEntity } from './products-to-categories.entity';

@Entity({ name: 'product' })
export class ProductEntity extends BaseEntity {
  @PrimaryColumn()
  key!: string;

  @Column()
  slug: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  status: BooleanEnum;

  @OneToMany(
    () => ProductsToCategoriesEntity,
    (productsToCategories) => productsToCategories.product,
    {
      cascade: ['insert'],
    },
  )
  productsToCategories: ProductsToCategoriesEntity[];
}
