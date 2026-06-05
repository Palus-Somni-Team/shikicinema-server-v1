import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MeilisearchService } from './meilisearch.service';
import { AnimeEntity } from '../../../entities';

@Global()
@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forFeature([
            AnimeEntity,
        ]),
    ],
    providers: [
        MeilisearchService,
    ],
    exports: [MeilisearchService],
})
export class MeilisearchModule {}
