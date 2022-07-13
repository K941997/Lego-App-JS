import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './../entities/product.entity';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { FindAllProductsClientDto } from './../dtos/client/find-all-products-client.dto';

@Injectable()
export class ProductClientService {
  constructor(
    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  //!GETALL Products Client:
  async findAllProductsClient(
    options: IPaginationOptions,
    params: FindAllProductsClientDto,
  ): Promise<Pagination<ProductEntity>> {
    const { slug, status, enabled } = params;
    const opts = {
      ...(enabled && { enabled }),
    };

    const queryBuilder = this.productRepository.createQueryBuilder('products');
    queryBuilder
      .select('products.key')
      .groupBy('products.key')
      .where(() => {
        //Solution Problem 1: Hiển thị route thì phải show các slug, enabled, status nếu có chứ ko được hiện undefined
        if (enabled) {
          queryBuilder.andWhere(opts);
        }
        if (slug) {
          queryBuilder.andWhere('products.slug LIKE :slug', {
            slug: `%${slug}`,
          });
          options.route += `&slug=${slug}`;
        }
        if (status) {
          queryBuilder.andWhere('products.status LIKE :status', {
            status: `%${status}`,
          });
          options.route += `&status=${status}`;
        }
      })
      .orderBy('products.key', 'ASC');

    const result = await paginate<ProductEntity>(queryBuilder, options);

    //Solution Problem 2: Paginate limit=10 đếm theo tổng productToCategory chứ ko phải tổng product:
    return new Pagination<ProductEntity>(
      await Promise.all(
        result.items.map(async (productHasKey) => {
          const product = await this.productRepository
            .createQueryBuilder('products')
            // .leftJoinAndSelect('', '')
            .where('products.key = :key', { key: productHasKey.key })
            .getOne();

          return product;
        }),
      ),
      result.meta,
      result.links,
    );
  }

  //!GETONE Product Client:
  //Nếu MultiLanguage thì thêm params lang vào dto getone
  async findOneProductClient(key: string) {
    const existProduct = await this.productRepository
      .createQueryBuilder('product')
      .where({ key })
      .getOne();

    if (!existProduct) {
      throw new NotFoundException('Not Found Product');
    }

    return existProduct;
  }
}
