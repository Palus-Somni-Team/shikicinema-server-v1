import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Index, Meilisearch } from 'meilisearch';

import { AnimeEntity, StudioEntity } from '../../../entities';
import { animeToSearchDoc, studioToSearchDoc } from './utils';

@Injectable()
export class MeilisearchService implements OnModuleInit {
    private readonly logger = new Logger('Meilisearch');

    private client!: Meilisearch;
    private animesIndex!: Index;
    private studiosIndex!: Index;

    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        @InjectRepository(StudioEntity)
        private readonly studioRepo: Repository<StudioEntity>,

        private readonly config: ConfigService,
    ) {}

    async onModuleInit() {
        const host = this.config.getOrThrow<string>('SHIKICINEMA_API_V1_MEILISEARCH_API');
        const apiKey = this.config.getOrThrow<string>('SHIKICINEMA_API_V1_MEILISEARCH_KEY');

        this.client = new Meilisearch({ host, apiKey });
        this.animesIndex = this.client.index('anime');
        this.studiosIndex = this.client.index('studios');

        try {
            await this.client.health();

            await this.animesIndex.updateSettings({
                searchableAttributes: ['titles.ru', 'titles.en', 'titles.ja'],
                displayedAttributes: ['id', 'titles', 'score', 'poster'],
                rankingRules: [
                    'words',
                    'typo',
                    'exactness',
                    'attribute',
                    'proximity',
                    'sort',
                ],
                sortableAttributes: ['score', 'id'],
            });

            await this.studiosIndex.updateSettings({
                searchableAttributes: ['name', 'russian'],
                displayedAttributes: ['id', 'name', 'russian', 'poster'],
                rankingRules: [
                    'words',
                    'typo',
                    'exactness',
                    'attribute',
                    'proximity',
                    'sort',
                ],
                sortableAttributes: ['name', 'id'],
            });

            // Первичная индексация, если индекс пустой
            const stats = await this.animesIndex.getStats();

            if (stats.numberOfDocuments === 0) {
                this.logger.log('Empty animes index, starting full reindex');
                await this.indexAllAnimes();
            }

            const studioStats = await this.studiosIndex.getStats();

            if (studioStats.numberOfDocuments === 0) {
                this.logger.log('Empty studios index, starting full reindex');
                await this.indexAllStudios();
            }

            this.logger.log('Connected to Meilisearch');
        } catch (err) {
            this.logger.error('Failed to connect to Meilisearch', err);
        }
    }

    async searchAnimes(query: string, limit = 50): Promise<number[]> {
        const { hits } = await this.animesIndex.search(query, {
            attributesToRetrieve: ['id'],
            sort: ['score:desc', 'id:asc'],
            limit,
        });

        return hits.map(({ id }) => id as number);
    }

    async indexAllAnimes(): Promise<void> {
        const BATCH = 1_000;

        let offset = 0;
        let animes: AnimeEntity[];

        do {
            animes = await this.animeRepo.find({
                relations: { titles: true },
                skip: offset,
                take: BATCH,
            });

            if (animes.length > 0) {
                const docs = animes.map(animeToSearchDoc);

                await this.animesIndex.addDocuments(docs, { primaryKey: 'id' });

                offset += animes.length;

                this.logger.log(`Indexed ${offset} animes`);
            }
        } while (animes.length >= BATCH);

        this.logger.log(`Indexed total ${offset} animes`);
    }

    async searchStudios(query: string, limit = 50, offset = 0): Promise<number[]> {
        const { hits } = await this.studiosIndex.search(query, {
            attributesToRetrieve: ['id'],
            limit,
            offset,
        });

        return hits.map(h => h.id as number);
    }

    async indexAllStudios(): Promise<void> {
        const studios = await this.studioRepo.find();
        const docs = studios.map(studioToSearchDoc);

        await this.studiosIndex.addDocuments(docs, { primaryKey: 'id' });

        this.logger.log(`Indexed ${docs.length} studios`);
    }
}
