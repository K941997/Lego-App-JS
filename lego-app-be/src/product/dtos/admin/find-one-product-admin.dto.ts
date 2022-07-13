import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { BooleanEnum } from '../../../commons/constants/global.constant';

export class FindOneProductAdminDto {
  @IsNumber()
  @IsOptional()
  //   @IsEnum({ enum: BooleanEnum })?
  enabled?: BooleanEnum;
}
