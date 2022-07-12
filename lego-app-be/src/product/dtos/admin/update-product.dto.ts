import { PartialType } from '@nestjs/mapped-types';
import { CreateProductAdminDto } from './create-product.dto';

export class UpdateProductAdminDto extends PartialType(CreateProductAdminDto) {}
