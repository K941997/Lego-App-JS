import { BooleanEnum, LangEnum } from '../../common/constants/global.constant';
import {
  IsValidText,
  IsValidEnumString,
  IsValidEnumNumber,
} from '../../common/decorators/custom-validator.decorator';


export class UpdateTopicDto {
  // key: string; //Cant update key because Primary Key

  @IsValidText({ minLength: 5, maxLength: 255, required: false })
  description: string;

  @IsValidEnumNumber({ enum: BooleanEnum, required: false })
  enabled: BooleanEnum;
  
  @IsValidText({ minLength: 2, maxLength: 50, required: false })
  name: string;

  @IsValidEnumString({ enum: LangEnum, required: false })
  lang: LangEnum;


}
