###### 1. Settings:
$ npm install -g @nestjs/cli
$ nest new project-name
-> .eslintrc.js:
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },

###### 2. Running:
$ npm run start:dev (sử dụng sẽ auto nodemon)
-> Open localhost:3000/

###### 3. Tạo tất cả: 
  $ nest g resource messages

- Để tạo 1 Module:
  $ nest g module messages
  
- Để tạo 1 Controller(Route) sử dụng các class và decorator:
  $ nest g controller messages

- Để Controller dùng Service phải có:
  constructor(private readonly tagsService: TagsService) {}

- Để tạo 1 Service(Logic):
  $ nest g service messages

- Để tạo 1 Repository(Lấy dữ liệu Database):
  Tạo file messages.repository.ts

- Với SQL PostgreSQL (phải + không cần tạo Repository riêng): typeorm hỗ trợ ở Service lấy dữ liệu Database
- Với NoSQL MongoDB (phải có Repository riêng): không có typeorm hỗ trợ ở Service để lấy dữ liệu Database

###### 4. GlobalPrefix:
- main.ts:
  app.setGlobalPrefix('api');


###### 5. Entity: (Model, Thực thể Table in Database)
- product.entity.ts:
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


###### 6. Repository: (Kho Chứa Thực Thể Entity + Service) (Optional)
- Repository task.repository.ts:
  import { EntityRepository, Repository } from 'typeorm';
  import { ProductEntity } from './../entities/product.entity';

  @EntityRepository(ProductEntity)
  export class ProductRepository extends Repository<ProductEntity> {}

###### 7. Add TypeOrm To product.module (Bắt buộc):
- Module tasks.module.ts với custom Repository (Optional):
  @Module({
    imports: [
      TypeOrmModule.forFeature([
        ProductRepository,
        ProductsToCategoriesRepository,
      ]),
    ],
    controllers: [ProductAdminController, ProductClientController],
    providers: [ProductAdminService, ProductClientService],
  })
  export class ProductModule {}


###### 8. Database - TypeOrm - PostgreSQL - 0.2.45:
$ npm install --save @nestjs/typeorm typeorm pg @nestjs/config

Bản typeorm 0.2.45:
$ npm run migration:generate 'init-product'

Bản typeorm 0.3.5:
$ npm run migration:generate ./migrations/init-product

- ormconfig.js
  let dbConfig = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    
    migrationsRun: false,
    synchronize: false,
    logging: false,

    migrations: ['dist/migrations/*.js'],
    entities: ['**/*.entity.js'],
    
    cli: {
      migrationsDir: 'migrations', // create migration file and save to this folder
    },
  };
  
  switch (process.env.NODE_ENV) {
    case 'development':
      dbConfig = {
        ...dbConfig,
        migrationsRun: true,
        logging: false,
      };
      break;
    case 'test':
      dbConfig = {
        ...dbConfig,
        // type: 'sqlite',
        migrationsRun: true,
        entities: ['**/*.entity.ts'],
      };
      break;
    case 'production':
      dbConfig = {
        ...dbConfig,
      };
      break;
  
    default:
      throw new Error('unknow environment typeorm config');
  }
  
  module.exports = dbConfig;
  

- app.module.ts:
  imports: [TypeOrmModule.forRoot(), TasksModule],
  controllers: [AppController],
  providers: [AppService],

- package.json:
  scripts: [
    "typeorm": "node --require ts-node/register node_modules/typeorm/cli.js",
    "migration:create": "npm run build && npm run typeorm migration:create -- -n",
    "migration:generate": "npm run build && npm run typeorm migration:generate -- -n",
    "migration:up": "npm run build && npm run typeorm migration:run",
    "migration:down": "npm run build && npm run typeorm migration:revert"
  ]

  "typeorm": "^0.2.45",

  
###### 9. Validation Pipe CRUD DTO:
- Để cài Validate Pipe:
$ npm i --save class-validator class-transformer

-> Cách 1: Global main.ts:
    import {Validate Pipe}
    app.useGlobalPipes(
      new ValidationPipe()
    );

-> Cách 2: Not Global level.controller:
    @Post('create')
    @UsePipes(ValidationPipe)
    createMessage(@Body() body: MessageDTO) {
        return this.messagesService.create(body.content);
    }

- example.dto:
    import { IsString } from 'class-validator'
    export class MessageDTO {
        @IsString()
        content: string
        @IsEmail()
        @IsDefined()
        @IsNotEmpty()
        //Đối với address: Tạo CreateAddressDTO
        @IsNotEmptyObject() //-> Không để trống Object
        @ValidateNested() //-> Để Validate 1 Object ví dụ: Address(line1,line2,zip,city)
        @Type(() => CreateAddressDTO) //-> Định dạng kiểu
        address: CreateAddressDTO;
    }

- example.controller:
    @Post()
    createMessage(@Body() body: MessageDTO) {
        return this.messagesService.create(body.content);
    }

###### 10. CRUD:
# Create Product:
- create-product.dto.ts:
  import {
    IsString,
    MinLength,
    MaxLength,
    IsOptional,
    IsNotEmpty,
    IsNumber,
    IsEnum,
  } from 'class-validator';
  import { BooleanEnum } from '../../commons/constants/global.constant';

  // export enum BooleanEnum { //!cho vào file global.constant
  //   TRUE = 1, //"Available now" client and admin can see
  //   FALSE = -1, //"Disable" only admin can see
  // }

  export class CreateProductDto {
    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsNotEmpty()
    key: string;

    @IsString()
    @MinLength(5)
    @MaxLength(50)
    @IsNotEmpty()
    name: string;

    @IsString()
    @MinLength(50)
    @MaxLength(255)
    @IsOptional()
    image: string;

    @IsNumber()
    @IsOptional()
    price: number;

    @IsString()
    @MinLength(50)
    @MaxLength(255)
    @IsOptional()
    description: string;

    @IsEnum({ enum: BooleanEnum })
    @IsOptional()
    status: BooleanEnum;
  }

- product-admin.service.ts:






