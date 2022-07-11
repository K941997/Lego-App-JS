import { Module } from '@nestjs/common';
import { LevelService } from './level.service';
import { LevelController } from './level.controller';
import { LevelAdminController } from './controllers/level-admin.controller';
import { LevelClientController } from './controllers/level-client.controller';
import { LevelTranslation } from './entities/level-translation.entity';
import { Level } from './entities/level.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UtilsModule } from '../utils-module/utils.module';
import { LevelRepository } from './repositories/topic.repository';
import { LevelTranslationRepository } from './repositories/topic-translation.repository';

@Module({
  imports: [UtilsModule, TypeOrmModule.forFeature([LevelRepository, LevelTranslationRepository])], //UtilsModule has i18n
  controllers: [LevelAdminController, LevelClientController],
  providers: [LevelService],
})
export class LevelModule {}
