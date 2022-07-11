import {
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { BooleanEnum } from '../../../commons/constants/global.constant';

export class FindAllProductsAdminDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  @IsOptional()
  slug?: string;

  @IsNumber()
  @IsOptional()
  enabled?: BooleanEnum;
}
