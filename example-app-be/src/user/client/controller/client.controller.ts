import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  Authenticate,
  GetUser
} from '../../../common/decorators/auth.decorator';
import { ManualSerialize } from '../../../common/interceptors/serialize.interceptor';
import { User } from '../../entities/user.entity';
import { ChooseLevelTopicDto } from '../dto/req/choose-level-topic.dto';
import { LoginDTO } from '../dto/req/login.dto';
import { RegisterDTO } from '../dto/req/register.dto';
import { RegisterResDTO } from '../dto/res/register.dto';
import { ClientService } from '../service/client.service';

@Controller('client')
@ApiTags('Client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register new client' })
  @ManualSerialize(RegisterResDTO)
  register(@Body() body: RegisterDTO) {
    return this.clientService.register(body);
  }

  @Post('/login')
  @ApiOperation({ summary: 'Client login' })
  login(@Body() body: LoginDTO) {
    return this.clientService.login(body);
  }

  @Get('relevant-contents')
  @Authenticate()
  getRelevantContents(@GetUser() user: User) {
    return this.clientService.getRelevantContents(user);
  }

  @Post('choose-level-topics')
  @HttpCode(200)
  @Authenticate()
  chooseTopics(@Body() body: ChooseLevelTopicDto, @GetUser() user: User) {
    return this.clientService.chooseTopicsAndLevel(body, user);
  }
}
