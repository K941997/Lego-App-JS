import { PartialType } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { BooleanEnum, LangEnum } from '../../common/constants/global.constant';
import {
  IsValidEnumNumber,
  IsValidEnumString,
  IsValidText,
} from '../../common/decorators/custom-validator.decorator';
import { CreateLevelDto } from './create-level.dto';

export class UpdateLevelDto {
  // key: string; //Cant update key because Primary Key

  @IsValidText({ minLength: 5, maxLength: 255, required: false })
  description: string;

  @IsValidEnumNumber({ enum: BooleanEnum, required: false })
  enabled: BooleanEnum;

  @IsValidText({ minLength: 5, maxLength: 50, required: false })
  name: string;

  @IsValidEnumString({ enum: LangEnum, required: false })
  lang: LangEnum;
}
