import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetUser } from '../common/decorators/auth.decorator';
import { User } from '../user/entities/user.entity';
import { AddHighlightWordReqDto } from './dtos/req/add-highlight-word.req.dto';
import { DeleteHighlightWordReqDto } from './dtos/req/delete-highlight-words.req.dto';
import { HighlightService } from './highlight.service';

@Controller('highlight')
@ApiTags('Highlight')
// @Authenticate()
export class HighlightController {
  constructor(private readonly highlightService: HighlightService) {}

  @Post('word')
  async addUserHighlightWord(
    @Body() body: AddHighlightWordReqDto,
    @GetUser() user: User,
  ) {
    // return this.highlightService.addUserHighlightWord(body, user);

    // Mocking
    return this.highlightService.addUserHighlightWord(body, { id: 1 } as User);
  }

  @Get('word')
  async getUserHighlightWord(@GetUser() user: User) {
    return this.highlightService.getUserHighlightWord({ id: 1 } as User);
  }

  @Delete('word')
  async deleteUserHighlightWords(
    @Body() body: DeleteHighlightWordReqDto,
    @GetUser() user: User,
  ) {
    return this.highlightService.deleteUserHighlightWords(body, {
      id: 1,
    } as User);
  }
}
