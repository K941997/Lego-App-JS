// import { CustomRepository } from '../../typeorm-repository/typeorm-ex.decorator';
import { EntityRepository, Repository } from 'typeorm';
import { ProductEntity } from './../entities/product.entity';

@EntityRepository(ProductEntity) //!Repository không dùng được ở bản TypeOrm mới 0.3.0
export class ProductRepository extends Repository<ProductEntity> {}
