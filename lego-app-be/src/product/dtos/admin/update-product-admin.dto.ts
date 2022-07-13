import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsString, MaxLength, MinLength, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { BooleanEnum, StatusEnum } from 'src/commons/constants/global.constant';
import { CreateProductAdminDto } from './create-product-admin.dto';

export class UpdateProductAdminDto {

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsOptional()
  name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  image: string;

  @IsNumber()
  @IsOptional()
  price: number;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsOptional()
  description: string;

  @IsEnum(BooleanEnum)
  @IsOptional()
  enabled: BooleanEnum;

  @IsEnum(StatusEnum)
  @IsOptional()
  status: StatusEnum;
}
