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
  // { unique: true }
  name: string;

  @Column({
    nullable: true,
  })
  image: string;

  @Column({
    nullable: true,
  })
  price: number;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  enabled: BooleanEnum;

  @OneToMany(
    () => ProductsToCategoriesEntity,
    (productsToCategories) => productsToCategories.product,
    {
      cascade: ['insert'],
    },
  )
  productsToCategories: ProductsToCategoriesEntity[];
}
