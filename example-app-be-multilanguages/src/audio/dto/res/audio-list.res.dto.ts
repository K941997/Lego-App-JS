import { PaginationResultDto } from '../../../common/dtos/pagination.dto';
import { Audio } from '../../entities/audio.entity';

export class AudioListResDto extends PaginationResultDto {
  items: Audio[];
}
