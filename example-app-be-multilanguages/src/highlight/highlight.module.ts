import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvDictRepository } from '../dictionary/repository/video-highlight-words.repository';
import { HighlightController } from './highlight.controller';
import { HighlightService } from './highlight.service';
import { UserHighlightWordsRepository } from './repositories/user-highlight-words.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserHighlightWordsRepository, EvDictRepository]),
  ],
  controllers: [HighlightController],
  providers: [HighlightService],
})
export class HighlightModule {}
