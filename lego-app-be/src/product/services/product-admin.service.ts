import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { CreateProductAdminDto } from '../dtos/admin/create-product-admin.dto';
import { UpdateProductAdminDto } from '../dtos/admin/update-product-admin.dto';
import * as slug from 'slug';
import { ProductEntity } from './../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindAllProductsAdminDto } from '../dtos/admin/find-all-products-admin.dto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { FindOneProductAdminDto } from '../dtos/admin/find-one-product-admin.dto';

@Injectable()
export class ProductAdminService {
  constructor(
    // private productRepository: ProductRepository, //!Custom Repository không dùng được ở bản TypeOrm mới 0.3.0
    // private productRepository: Repository<ProductEntity>,
    // @Inject('PRODUCT_REPOSITORY')
    //private productRepository: ProductRepository

    @InjectRepository(ProductEntity)
    private productRepository: Repository<ProductEntity>,
  ) {}

  slugify(key: string) {
    return slug(key, { lower: true }).toString();
  }

  //!CREATE Product Admin:
  async createProductAdmin(
    createProductAdminDto: CreateProductAdminDto,
  ): Promise<ProductEntity> {
    const { key, name, image, price, description, enabled, status } =
      createProductAdminDto;

    const existProduct = await this.productRepository.findOneBy({ key: key });
    if (existProduct) {
      throw new ConflictException(`Duplicate Product`);
    }

    const newProduct = await this.productRepository.create(
      createProductAdminDto,
    );
    newProduct.slug = this.slugify(key);

    return this.productRepository.save(newProduct);
  }

  //!GETALL Products Admin:
  async findAllProductsAdmin(
    options: IPaginationOptions, //page, limit
    params: FindAllProductsAdminDto, //slug, enabled, status
  ): Promise<Pagination<ProductEntity>> {
    const { slug, enabled, status } = params;

    const queryBuilder = await this.productRepository.createQueryBuilder(
      'products',
    );
    queryBuilder
      .select('products.key')
      .groupBy('products.key')
      .where(() => {
        //Solution Problem 1: Hiển thị route thì phải show các slug, enabled, status nếu có chứ ko được hiện undefined
        if (slug) {
          queryBuilder.andWhere('products.slug LIKE :slug', {
            slug: `%${slug}`,
          });
          options.route += `&slug=${slug}`;
        }
        if (status) {
          queryBuilder.andWhere('products.status LIKE :status', {
            //LIKE with boolean string
            status: `%${status}`,
          });
          options.route += `&status=${status}`;
        }
        if (enabled) {
          queryBuilder.andWhere('products.enabled = :enabled', {
            //= with boolean number
            enabled,
          });
          options.route += `&enabled=${enabled}`;
        }
      })
      .orderBy('products.key', 'ASC');

    const result = await paginate<ProductEntity>(queryBuilder, options);

    //Solution Problem 2: Paginate limit=10 đếm theo tổng productToCategory chứ ko phải tổng product
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

  //!GETONE Product Admin:
  async findOneProductAdmin(key: string, params: FindOneProductAdminDto) {
    const { enabled } = params;
    const existProduct = await this.productRepository
      .createQueryBuilder('product')
      .where({
        key,
        ...(enabled && { enabled }),
      })
      .getOne();

    return existProduct;
  }

  //!UPDATEONE:
  update(id: number, updateProductAdminDto: UpdateProductAdminDto) {
    return `This action updates a #${id} product`;
  }

  //!DELETEONE:
  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
