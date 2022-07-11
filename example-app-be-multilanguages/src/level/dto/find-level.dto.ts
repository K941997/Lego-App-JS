import PaginateDto from '../../common/dtos/paginate.dto';
import { BooleanEnum, LangEnum } from '../../common/constants/global.constant';
import {
  IsValidEnumNumber,
  IsValidEnumString,
  IsValidNumber,
  IsValidText,
} from '../../common/decorators/custom-validator.decorator';
import { IsOptional } from 'class-validator';

export class FindOneLevelDto {
  @IsValidEnumString({ enum: LangEnum, required: false })
  lang?: LangEnum;

  @IsValidNumber() //can't use IsValidEnumNumber()
  @IsOptional()
  enabled?: BooleanEnum; //admin: 1 or 0 || client: only 1
}

export class FindManyLevelsDto extends PaginateDto {
  @IsValidText({ required: false })
  slug?: string;

  @IsValidEnumString({ enum: LangEnum, required: false })
  lang?: LangEnum; //lang=en

  @IsValidNumber() //can't use IsValidEnumNumber()
  @IsOptional()
  enabled?: BooleanEnum;
}
