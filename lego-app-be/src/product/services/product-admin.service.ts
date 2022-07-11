/* eslint-disable prettier/prettier */
import { Injectable, ConflictException, Inject } from '@nestjs/common';
import { CreateProductAdminDto } from '../dtos/admin/create-product.dto';
import { UpdateProductDto } from '../dtos/admin/update-product.dto';
import * as slug from 'slug';
import { ProductEntity } from './../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FindAllProductsAdminDto } from './../dtos/admin/find-all-products.dto';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { FindOneProductAdminDto } from './../dtos/admin/find-one-product.dto';

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

  async createProductAdmin(
    createProductAdminDto: CreateProductAdminDto,
  ): Promise<ProductEntity> {
      const { key, name, image, price, description, enabled } = createProductAdminDto;

      const existProduct = await this.productRepository.findOneBy({ key: key });
      if (existProduct) {
        throw new ConflictException(`Duplicate Product ` + existProduct);
      }
     
      const newProduct = await this.productRepository.create(createProductAdminDto);
      newProduct.slug = this.slugify(key);

      return this.productRepository.save(newProduct);
  }

  async findAllProductsAdmin(
    options: IPaginationOptions,
    params: FindAllProductsAdminDto
  ): Promise<Pagination<ProductEntity>> {
    const { slug, enabled } = params;
    const opts = {
      ...(enabled && { enabled })
    }

    const queryBuilder = await this.productRepository.createQueryBuilder('product');
    queryBuilder
      .where(() => {
        queryBuilder.where(opts)
        if (slug) 
          queryBuilder.andWhere('product.slug LIKE :slug', { slug: `%${slug}` });
      })
      .orderBy('product.key', 'ASC');

    return paginate<ProductEntity>(queryBuilder, options)

  }

  async findOneProductAdmin(key: string, params: FindOneProductAdminDto ) {
    const { enabled } = params;
    const existProduct = await this.productRepository.createQueryBuilder('product')
      .where({
        key,
        ...(enabled && { enabled })
      })
      .getOne();

    return existProduct;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
