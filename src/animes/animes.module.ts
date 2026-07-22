import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HttpModule } from '@nestjs/axios';

import { AnimesController } from './animes.controller';
import { AnimesService } from './animes.service';
import { AnimeSyncService } from './anime-sync.service';
import { ShikimoriGQLService } from './shikimori-gql.service';
import {
  AnimeEntity,
  AnimeGenreEntity,
  AnimeStudioEntity,
  AnimeTitleEntity,
  GenreEntity,
  StudioEntity,
} from '../entities';

@Module({
    imports: [
      HttpModule,
      TypeOrmModule.forFeature([
        AnimeEntity,
        AnimeTitleEntity,
        GenreEntity,
        StudioEntity,
        AnimeGenreEntity,
        AnimeStudioEntity,
      ]),
      ScheduleModule.forRoot(),
    ],
    controllers: [AnimesController],
    providers: [
      AnimesService,
      AnimeSyncService,
      ShikimoriGQLService,
    ],
    exports: [AnimesService],
})
export class AnimesModule {}
