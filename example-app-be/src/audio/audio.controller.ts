import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ManualSerialize } from '../common/interceptors/serialize.interceptor';
import { AudioService } from './audio.service';
import { AddHighlightWordDto } from './dto/req/add-highlight-word.dto';
import { CreateAudioDto } from './dto/req/create-audio.dto';
import { DeleteAudiosReqDto } from './dto/req/delete-audio.dto';
import { DeleteHighlightWordDto } from './dto/req/delete-highlight-word.dto';
import { GetAudioListReqDto } from './dto/req/get-audio-list.req.dto';
import { UpdateAudioTranscriptDto } from './dto/req/update-audio-transcript.dto';
import { UpdateAudioDto } from './dto/req/update-audio.dto';
import { AudioListResDto } from './dto/res/audio-list.res.dto';
import { CreateAudioResDto } from './dto/res/create-audio-res.dto';

@Controller('audio')
@ApiTags('Audios')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Get()
  @ApiOperation({ summary: 'Get list audio' })
  @ApiOkResponse({ type: AudioListResDto })
  @ManualSerialize(AudioListResDto)
  getVideoList(@Query() query: GetAudioListReqDto): Promise<AudioListResDto> {
    return this.audioService.getAudioList(query, `audio`);
  }

  @Post()
  @ApiOperation({ summary: 'Save new audio' })
  @ApiOkResponse({ type: CreateAudioResDto })
  @ManualSerialize(CreateAudioResDto)
  async create(@Body() createAudioDto: CreateAudioDto) {
    return this.audioService.create(createAudioDto);
  }

  @Get('/transcribing-status')
  @ApiOperation({ summary: 'Get all transcribing job status based on name' })
  async getListTranscribeJobByName(@Query('name') name: string) {
    return this.audioService.getListAudioTranscriptStatus(name);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audioId: {
          type: 'number',
        },
      },
    },
  })
  @Post('/convert-to-text')
  @ApiOperation({ summary: 'Convert audio to text' })
  async convertAudioToText(@Body('audioId') audioId: number) {
    return this.audioService.convertAudioToText(audioId);
  }

  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        audioId: {
          type: 'number',
        },
      },
    },
  })
  @Post('/transript')
  @ApiOperation({ summary: 'Save audio transcript of transcribed audio' })
  async createAudioTranscript(@Body('audioId') audioId: number) {
    return this.audioService.saveAudioTranscript(audioId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audio details' })
  @ApiOkResponse({ type: CreateAudioResDto })
  @ManualSerialize(CreateAudioResDto)
  async getOne(@Param('id') id: number) {
    return this.audioService.getOneWithThumbnail(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audio' })
  @ApiOkResponse({ type: AudioListResDto })
  async updateAudio(@Param('id') id: number, @Body() body: UpdateAudioDto) {
    return this.audioService.update(id, body);
  }

  @Post('/transcript/highlight-words')
  @ApiOperation({ summary: 'Highlight words in audio transcript' })
  async highlightWords(@Body() body: AddHighlightWordDto) {
    return this.audioService.highlightWords(body);
  }

  @Delete('/transcript/highlight-words')
  @ApiOperation({ summary: 'Delete single highlight word in audio' })
  async removeHighlightWords(@Body() body: DeleteHighlightWordDto) {
    return this.audioService.removeHighlightWord(body);
  }

  @Patch('/transcript/:id')
  @ApiOperation({ summary: 'Update audio transcript' })
  async updateAudioTranscript(
    @Param('id') id: number,
    @Body() body: UpdateAudioTranscriptDto,
  ) {
    return this.audioService.updateAudioTranscript(id, body);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete audio' })
  async deleteAudios(@Body() body: DeleteAudiosReqDto) {
    return this.audioService.deleteAudios(body);
  }
}
