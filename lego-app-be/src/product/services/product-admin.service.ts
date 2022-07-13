import {
  Injectable,
  ConflictException,
  Inject,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductAdminDto } from '../dtos/admin/create-product-admin.dto';
import { UpdateProductAdminDto } from '../dtos/admin/update-product-admin.dto';
import * as slug from 'slug';
import { ProductEntity } from './../entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
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
  //Nếu MultiLanguage thì thêm params lang vào dto getone
  async findOneProductAdmin(key: string) {
    const existProduct = await this.productRepository
      .createQueryBuilder('product')
      .where({
        key,
      })
      .getOne();

    if (!existProduct) {
      throw new NotFoundException('Not Found Product');
    }

    return existProduct;
  }

  //!UPDATEONE Product Admin:
  async updateOneProductAdmin(
    key: string,
    updateProductAdminDto: UpdateProductAdminDto,
  ) {
    const { name, image, price, description, enabled, status } =
      updateProductAdminDto;

    const existProduct = await this.productRepository.findOneBy({ key: key });
    if (!existProduct) {
      throw new NotFoundException('Not Found Product');
    }

    if (updateProductAdminDto) {
      existProduct.name = name;
      existProduct.image = image;
      existProduct.price = price;
      existProduct.description = description;
      existProduct.enabled = enabled;
      existProduct.status = status;
    }

    await this.productRepository.save(existProduct);
    return this.findOneProductAdmin(key); //Nếu multilanguages thì thêm params lang vào dto getone
  }

  //!DELETEONE Product Admin:
  async deleteOneProductAdmin(key: string) {
    //Problem: n-1 Xóa Product phải xóa cả các Relation của Product:
    //Problem: 1-n Muốn xóa Theme phải xóa hết các Product và Relation Product liên quan đến Theme:
    //Problem: nếu có bản multilanguages thì phải softDelete:
    const productToDelete = await this.productRepository.findOneBy({
      key: key,
    });
    if (!productToDelete) {
      throw new NotFoundException('Not Found Product');
    }

    return await Promise.all([
      this.productRepository.softDelete({ key: key, deletedAt: IsNull() }),
      // this.videosToTopicRepo.softDelete({
      //   videosId: key,
      //   deletedAt: IsNull()
      // }),
    ]);
  }

  //!DELETEMULTI Products Admin:
  async deleteMultiProductsAdmin(keys: string[]) {
    //Problem: n-1 Xóa Product phải xóa cả các Relation của Product:
    //Problem: 1-n Muốn xóa Theme phải xóa hết các Product và Relation Product liên quan đến Theme:
    //Problem: nếu có bản multilanguages thì phải softDelete:

    const [result] = await Promise.all([
      this.productRepository.softDelete({
        key: In(keys),
        deletedAt: IsNull(),
      }),
      // this.videosToTopicRepo.softDelete({
      //   videosId: In(ids),
      //   deletedAt: IsNull()
      // }),
    ]);
    if (!result.affected) {
      throw new NotFoundException('Not Found One One Product');
    }
    if (result.affected) {
      return 'Delete Multi Success';
    }

    return result;
  }
}
