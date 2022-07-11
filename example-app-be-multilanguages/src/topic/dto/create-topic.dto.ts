import { ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, MaxLength } from 'class-validator';
import { LangEnum, BooleanEnum } from '../../common/constants/global.constant';
import {
  IsValidText,
  IsValidEnumNumber,
  IsValidEnumString,
} from '../../common/decorators/custom-validator.decorator';
export class CreateTopicDto {
  @IsValidText({ minLength: 5, maxLength: 50, required: true })
  key: string;

  @IsValidText({ minLength: 5, maxLength: 255, required: false })
  description: string;

  @IsValidEnumNumber({ enum: BooleanEnum, required: false })
  enabled: BooleanEnum;

  @IsValidText({ minLength: 5, maxLength: 50, required: true })
  name: string;

  @ApiHideProperty()
  @IsValidEnumString({ enum: LangEnum, required: false })
  lang: LangEnum;

}
