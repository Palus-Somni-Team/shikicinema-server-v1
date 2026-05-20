import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AnimesController } from './animes.controller';
import { AnimesService } from './animes.service';
import { AnimeEntity, AnimeTitleEntity } from '../entities';

@Module({
    imports: [TypeOrmModule.forFeature([AnimeEntity, AnimeTitleEntity])],
    controllers: [AnimesController],
    providers: [AnimesService],
    exports: [AnimesService],
})
export class AnimesModule {}
