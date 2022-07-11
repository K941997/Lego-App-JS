import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { BooleanEnum } from '../../common/constants/global.constant';
import { BaseEntity } from '../../common/entities/base.entity';
import { UserToTopics } from '../../user/entities/user-to-topics.entity';
import { VideosToTopic } from '../../videos/entities/videos-to-topic.entity';
import { TopicTranslation } from './topic-translation.entity';

@Entity('topic')
export class Topic extends BaseEntity {
  @PrimaryColumn()
  key: string;

  @Column({
    nullable: true,
  })
  slug: string;

  @Column({
    nullable: true,
  })
  description: string;

  @Column({ enum: BooleanEnum, default: BooleanEnum.TRUE })
  enabled: BooleanEnum;

  
  @OneToMany(
    () => TopicTranslation,
    (topicTranslate: TopicTranslation) => topicTranslate.topic,
    {
      cascade: ['insert'],
    },
  )
  translates: TopicTranslation[];

  // Join videos_to_topic
  @OneToMany(() => VideosToTopic, (videosToTopic) => videosToTopic.topic, {
    cascade: ['insert'],
  })
  videosToTopics: VideosToTopic[];
  // End join videos

  // Join user_to_topics
  @OneToMany(() => UserToTopics, (userToTopics) => userToTopics.topic, {
    cascade: ['insert'],
  })
  userToTopics: UserToTopics[];
  // End join user_to_topics

  // Join audios_to_topic
  @OneToMany(() => VideosToTopic, (videosToTopic) => videosToTopic.topic, {
    cascade: ['insert'],
  })
  audiosToTopics: VideosToTopic[];
  // End join audios
}
