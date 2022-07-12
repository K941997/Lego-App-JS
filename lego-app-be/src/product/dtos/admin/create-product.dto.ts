import {
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsNotEmpty,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { BooleanEnum } from '../../../commons/constants/global.constant';

// export enum BooleanEnum { //!cho vào file global.constant
//   TRUE = 1, //"Available now" client and admin can see
//   FALSE = -1, //"Disable" only admin can see
// }

export class CreateProductAdminDto {
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
  enabled: BooleanEnum;
}
