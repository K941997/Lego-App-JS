import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DeepPartial,
  DeleteResult,
  In,
  IsNull,
  Like,
  Not,
  Repository,
} from 'typeorm';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { Topic } from './entities/topic.entity';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { TopicTranslation } from './entities/topic-translation.entity';
import { FindConditions } from 'typeorm';
import { TranslateService } from '../utils-module/services/translate.service';
import {
  ConflictExc,
  NotFoundExc,
} from '../common/exceptions/custom.exception';
import { FindManyTopicDto, FindTopicDto } from './dto/find-topic.dto';
import slug from 'slug';
import { LangEnum } from '../common/constants/global.constant';
import { TopicTranslationRepository } from './repositories/topic-translation.repository';
import { TopicRepository } from './repositories/topic.repository';
import { FindManyTopicDtoClient } from './dto/find-topic-client.dto';
import { UserToTopicsRepository } from './../user/repository/user-to-topics.repository';
import { AudiosToTopicsRepository } from '../audio/repository/audios-to-topics.repository';
import { VideosToTopicRepository } from './../videos/repositories/videos-to-topic.repository';


@Injectable()
export class TopicService {
  constructor(
    private topicTransRepo: TopicTranslationRepository,
    private topicRepository: TopicRepository,
    private translateService: TranslateService,
    private userToTopicsRepository: UserToTopicsRepository,
    private audiosToTopicsRepository: AudiosToTopicsRepository,
    private videosToTopicRepository: VideosToTopicRepository
  ) {}

  slugify(key: string) {
    return slug(key, { lower: true }).toString();
  }

  async findOneTransWith(opts: FindConditions<TopicTranslation>) {
    const exist = await this.topicTransRepo.findOne({
      where: opts,
    });
    return exist;
  }

  //Admin CREATE Topic (MultiLanguage):
  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const { key, description, name, lang, enabled } = createTopicDto;
    //check existTrans of any Topic:
    const existTranslate = await this.findOneTransWith({ name });
    const topicLocalize = await this.translateService.t('main.entity.topic'); //i18n
    if (existTranslate) throw new ConflictExc(topicLocalize);
    //check existTopic:
    const existTopic = await this.topicRepository.findOne({ key: key });
    if (existTopic) throw new ConflictExc(topicLocalize);
    //create Topic:
    const newTopic = this.topicRepository.create(createTopicDto);
    newTopic.slug = this.slugify(key); //slug
    //create trans for Topic:
    const newTopicTranslate = this.topicTransRepo.create(createTopicDto);
    newTopic.translates = [newTopicTranslate];
    return this.topicRepository.save(newTopic);
  }

  //Admin GETALL Topics + Search(slug) + Pagination (MultiLanguage):
  async findAllByAdmin(
    options: IPaginationOptions,
    params: FindManyTopicDto,
  ): Promise<Pagination<Topic>> {
    const { lang, enabled, slug } = params;
    const opts: FindConditions<Topic> = {
      ...(enabled && { enabled }),
    };
    const queryBuilder = this.topicRepository.createQueryBuilder('topic');
    queryBuilder
      .innerJoinAndSelect(
        'topic.translates',
        'topicTranslation',
        lang && 'topicTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where((queryBuilder) => {
        queryBuilder.where(opts);
        if (slug)
          queryBuilder.andWhere('topic.slug LIKE :slug', { slug: `%${slug}%` });
      })
      .orderBy('topic.key', 'ASC');

    return paginate<Topic>(queryBuilder, options);
  }

  //Admin GETONE Topic (MultiLanguage):
  async findOne(key: string, params: FindTopicDto) {
    const { lang, enabled } = params;
    const existTopic = await this.topicRepository
      .createQueryBuilder('topic')
      .innerJoinAndSelect(
        'topic.translates',
        'topicTranslation',
        lang && 'topicTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where({
        key,
        ...(enabled && { enabled }),
      })
      .getOne();

    // i18n:
    const topicLocalize = await this.translateService.t('main.entity.topic');
    if (!existTopic) throw new NotFoundExc('Not Found ' + topicLocalize);
    return existTopic;
  }

  //Admin UPDATEONE Topic (MultiLanguage):
  async update(key: string, updateTopicDto: UpdateTopicDto) {
    const { description, name, lang, enabled } = updateTopicDto;

    //check existTopic:
    const existTopic = await this.topicRepository.findOne({ key: key });
    if (!existTopic) {
      throw new NotFoundException('Topic not found');
    }

    //check existTrans:
    const existTrans = await this.findOneTransWith({
      topicKey: key,
      lang,
    });

    //check existTransName of other Level:
    const existTransName = await this.findOneTransWith({
      topicKey: Not(key),
      name,
    });
    const topicLocal = await this.translateService.t('main.entity.topic'); //i18n
    if (existTransName)
      throw new ConflictException('Duplicate TransName ' + topicLocal);

    //update Topic:
    //cant update key because it's primary key
    if (description) {
      existTopic.description = description;
    }
    if (enabled) {
      existTopic.enabled = enabled;
    }
  
    await this.topicRepository.save(existTopic);

    //update Trans
    //existTrans -> update, !existTrans -> add new:
    const payloadTopicTranslate: DeepPartial<TopicTranslation> = {
      ...(existTrans && { id: existTrans.id }),
      topicKey: key,
      ...updateTopicDto,
    };

    await this.topicTransRepo.save(payloadTopicTranslate);
    return this.findOne(key, { lang: lang });
  }

  //Admin REMOVEONE Topic (MultiLanguage):
  async remove(key: string) {
    const topicToDelete = await this.topicRepository.findOne(key);
    if (!topicToDelete) {
      throw new NotFoundException(`Topic not found !`);
    }

    const audiosToTopics = await this.audiosToTopicsRepository.findOne({topicKey: key})
    if (audiosToTopics) {
      throw new ConflictException(`The audio is linked to this topic`)
    }

    const videosToTopics = await this.videosToTopicRepository.findOne({ topicKey: key })
    if (videosToTopics) {
      throw new ConflictException(`The video is linked to this topic`)
    }

    return await Promise.all([
      this.topicRepository.softDelete({ key: key, deletedAt: IsNull() }),
      this.topicTransRepo.softDelete({ topicKey: key, deletedAt: IsNull() }),
    ]);
  }

  //Admin REMOVEMULTI Topics (MultiLanguage):
  async removeMulti(keys: string[]) {
    const audiosToTopics = await this.audiosToTopicsRepository.findOne({topicKey: In(keys)})
    if (audiosToTopics) {
      throw new ConflictException(`The audio is linked to one topic`)
    }

    const videosToTopics = await this.videosToTopicRepository.findOne({ topicKey: In(keys) })
    if (videosToTopics) {
      throw new ConflictException(`The video is linked to one topic`)
    }

    const [result] = await Promise.all([
      this.topicRepository.softDelete({ 
        key: In(keys), 
        deletedAt: IsNull() 
      }),
      this.topicTransRepo.softDelete({
        topicKey: In(keys),
        deletedAt: IsNull(),
      }),
    ]);

    const localize = await this.translateService.t('main.entity.topic'); //i18n
    if (!result.affected) throw new NotFoundExc(localize);
    
    return result;
  }

  //Client GETALL Topics + No Pagination (MultiLanguage):
  async findAllByClientNoPagination(
    params: FindManyTopicDtoClient,
  ): Promise<Topic[]> {
    const { lang, enabled } = params;
    const opts: FindConditions<Topic> = {
      ...(enabled && { enabled }),
    };
    const queryBuilder = await this.topicRepository
      .createQueryBuilder('topic')
      .innerJoinAndSelect(
        'topic.translates',
        'topicTranslation',
        lang && 'topicTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where(opts)
      .orderBy('topic.key', 'ASC')
      .getMany();

    return queryBuilder;
  }

  //Client GETALL Topics + Pagination (MultiLanguage):
  async findAllByClientPagination(
    options: IPaginationOptions,
    params: FindManyTopicDtoClient,
  ): Promise<Pagination<Topic>> {
    const { lang, enabled } = params;
    const opts: FindConditions<Topic> = {
      ...(enabled && { enabled }),
    };
    const queryBuilder = await this.topicRepository.createQueryBuilder('topic');
    queryBuilder
      .innerJoinAndSelect(
        'topic.translates',
        'topicTranslation',
        lang && 'topicTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where(opts)
      .orderBy('topic.key', 'ASC');

    return paginate<Topic>(queryBuilder, options);
  }


  //Client Get 4 Topics most selected:
  async findFeatureTopics(
    params: FindManyTopicDtoClient,
  ) {
    const { lang } = params;
  
    const queryBuilder = await this.userToTopicsRepository
      .createQueryBuilder('userToTopics')
      .leftJoinAndSelect(
        'userToTopics.topic', 'topic',
      )
      .leftJoinAndSelect(
        'topic.translates', 'topicTranslation',
        lang && 'topicTranslation.lang = :lang',
          {
            lang,
          },
      )
      .select('userToTopics.topicKey, topicTranslation.name')
      .groupBy('userToTopics.topicKey, topicTranslation.name')
      .limit(4)
      .orderBy('COUNT(userToTopics.topicKey)', 'DESC')
      .getRawMany()

    return queryBuilder;
  } 
}
