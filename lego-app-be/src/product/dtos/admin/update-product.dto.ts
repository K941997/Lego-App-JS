import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAdminDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductAdminDto) {}
