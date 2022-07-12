import {
  ConflictException, Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IPaginationOptions,
  paginate,
  Pagination
} from 'nestjs-typeorm-paginate';
import slug from 'slug';
import {
  DeepPartial,
  FindConditions,
  In,
  IsNull,
  Not,
  Repository
} from 'typeorm';
import { ConflictExc, NotFoundExc } from '../common/exceptions/custom.exception';
import { TranslateService } from '../utils-module/services/translate.service';
import { CreateLevelDto } from './dto/create-level.dto';
import { FindManyLevelsDtoClient } from './dto/find-level-client.dto';
import { FindManyLevelsDto, FindOneLevelDto } from './dto/find-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelTranslation } from './entities/level-translation.entity';
import { Level } from './entities/level.entity';
import { LevelTranslationRepository } from './repositories/topic-translation.repository';
import { LevelRepository } from './repositories/topic.repository';

@Injectable()
export class  LevelService {
  constructor(
    private levelRepo: LevelRepository,

    private levelTransRepo: LevelTranslationRepository,

    private translateService: TranslateService, //i18n
  ) {}

  slugify(key: string) {
    return slug(key, { lower: true }).toString();
  }

  async findOneTransWith(opts: FindConditions<LevelTranslation>) {
    const existTrans = await this.levelTransRepo.findOne({
      where: opts,
    });
    return existTrans;
  }

  //Admin CREATE Level (MultiLanguage):
  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const { key, description, name, lang, enabled } = createLevelDto;
    //check existTrans of any Level:
    const existTrans = await this.findOneTransWith({ name });
    const levelLocal = await this.translateService.t('main.entity.level'); //i18n
    if (existTrans) throw new ConflictExc(levelLocal);
    //check existLevel:
    const existLevel = await this.levelRepo.findOne({ key: key });
    if (existLevel) throw new ConflictExc(levelLocal);
    //create Level:
    const newLevel = this.levelRepo.create(createLevelDto);
    newLevel.slug = this.slugify(key); //slug
    //create trans for Level:
    const newLevelTrans = this.levelTransRepo.create(createLevelDto);
    newLevel.translates = [newLevelTrans];
    return this.levelRepo.save(newLevel);
  }

  //Admin GETALL Levels + Search(slug) + Pagination (MultiLanguage):
  async findAllByAdmin(
    options: IPaginationOptions,
    params: FindManyLevelsDto,
  ): Promise<Pagination<Level>> {
    const { slug, enabled, lang } = params;
    const opts: FindConditions<Level> = {
      // boolean 1/-1
      ...(enabled && { enabled }),
    };
    const queryBuilder = await this.levelRepo.createQueryBuilder('level');
    queryBuilder
      .innerJoinAndSelect(
        'level.translates',
        'levelTranslation', // camel key
        lang && 'levelTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where((sqb) => {
        queryBuilder.where(opts);
        if (slug)
          queryBuilder.andWhere('level.slug LIKE :slug', { slug: `%${slug}` });
      })
      .orderBy('level.key', 'ASC'); // order de duoi cung
    return paginate<Level>(queryBuilder, options);
  }

  //Admin GETONE Level (MultiLanguage):
  async findOne(key: string, params: FindOneLevelDto) {
    const { enabled, lang } = params;
    const existLevel = await this.levelRepo
      .createQueryBuilder('level')
      .innerJoinAndSelect(
        'level.translates',
        'levelTranslation',
        lang && 'levelTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where({
        key,
        ...(enabled && { enabled }),
      })
      .getOne();

    const levelLocal = await this.translateService.t('main.entity.level'); //i18n
    if (!existLevel) {
      throw new NotFoundExc('Not Found ' + levelLocal);
    }
    return existLevel;
  }

  //Admin UPDATEONE Level (MultiLanguage):
  async update(key: string, updateLevelDto: UpdateLevelDto) {
    //cho hết required: true
    const { description, enabled, name, lang } = updateLevelDto;

    //check existLevel:
    const existLevel = await this.levelRepo.findOne({ key });
    if (!existLevel) {
      throw new NotFoundException('Level not found');
    }

    //check existTrans:
    const existTrans = await this.findOneTransWith({
      levelKey: key,
      lang,
    });

    //check existTransName of other Level:
    const existTransName = await this.findOneTransWith({
      levelKey: Not(key),
      name,
    });
    const levelLocal = await this.translateService.t('main.entity.level'); //i18n
    if (existTransName)
      throw new ConflictException('Duplicate TransName ' + levelLocal);

    //update Level:
    //cant update key because it's primary key
    if (description) {
      existLevel.description = description;
    }
    if (enabled) {
      existLevel.enabled = enabled;
    }
    await this.levelRepo.save(existLevel);

    //update Trans:
    //existTrans -> update, !existTrans -> add new:
    const payloadLevelTranslate: DeepPartial<LevelTranslation> = {
      ...(existTrans && { id: existTrans.id }),
      levelKey: key,
      ...updateLevelDto,
    };

    await this.levelTransRepo.save(payloadLevelTranslate);
    return this.findOne(key, { lang: lang });
  }

  //Admin REMOVEONE Level (MultiLanguage):
  async remove(key: string) {
    const levelToDelete = await this.levelRepo.findOne(key);
    if (!levelToDelete) {
      throw new NotFoundException('Level Not Found!');
    }
    return await Promise.all([
      this.levelRepo.softDelete({ key: key, deletedAt: IsNull() }),
      this.levelTransRepo.softDelete({ levelKey: key, deletedAt: IsNull() }),
    ]);
  }

  //Admin REMOVEMULTI Levels (MultiLanguage):
  async removeMulti(keys: string[]) {
    const [result] = await Promise.all([
      this.levelRepo.softDelete({ key: In(keys), deletedAt: IsNull() }),
      this.levelTransRepo.softDelete({
        levelKey: In(keys),
        deletedAt: IsNull(),
      }),
    ]);

    const localize = await this.translateService.t('main.entity.level'); //i18n
    if (!result.affected) throw new NotFoundExc(localize);
    return result;
  }

  //Client GETALL Levels + No Pagination (MultiLanguage):
  async findAllByClientNoPagination(
    params: FindManyLevelsDtoClient,
  ): Promise<Level[]> {
    const { lang, enabled } = params;
    const opts: FindConditions<Level> = {
      ...(enabled && { enabled }),
    };
    const queryBuilder = await this.levelRepo
      .createQueryBuilder('level')
      .innerJoinAndSelect(
        'level.translates',
        'levelTranslation',
        lang && 'levelTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where(opts)
      .orderBy('level.key', 'ASC')
      .getMany();

    return queryBuilder;
  }

  //Client GETALL Levels + Pagination (MultiLanguage):
  async findAllByClientPagination(
    options: IPaginationOptions,
    params: FindManyLevelsDtoClient,
  ): Promise<Pagination<Level>> {
    const {lang, enabled } = params;
    const opts: FindConditions<Level> = {
      ...(enabled && { enabled }),
    };
    const queryBuilder = await this.levelRepo.createQueryBuilder('level');
    queryBuilder
      .innerJoinAndSelect(
        'level.translates',
        'levelTranslation',
        lang && 'levelTranslation.lang = :lang',
        {
          lang,
        },
      )
      .where(opts)
      .orderBy('level.key', 'ASC');

    return paginate<Level>(queryBuilder, options);
  }
}
