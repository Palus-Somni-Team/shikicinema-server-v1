import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Index, Meilisearch } from 'meilisearch';

import { AnimeEntity } from '../../../entities';
import { AnimeSearchDocument } from '../../types';

@Injectable()
export class MeilisearchService implements OnModuleInit {
    private readonly logger = new Logger('Meilisearch');

    private client!: Meilisearch;
    private index!: Index;

    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        private readonly config: ConfigService,
    ) {}

    async onModuleInit() {
        const host = this.config.getOrThrow<string>('SHIKICINEMA_API_V1_MEILISEARCH_API');
        const apiKey = this.config.getOrThrow<string>('SHIKICINEMA_API_V1_MEILISEARCH_KEY');

        this.client = new Meilisearch({ host, apiKey });
        this.index = this.client.index('anime');

        try {
            await this.client.health();

            await this.index.updateSettings({
                searchableAttributes: ['titles.ru', 'titles.en', 'titles.ja'],
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

            // Первичная индексация, если индекс пустой
            const stats = await this.index.getStats();

            if (stats.numberOfDocuments === 0) {
                this.logger.log('Empty index, starting full reindex');
                await this.indexAllAnimes();
            }

            this.logger.log('Connected to Meilisearch');
        } catch (err) {
            this.logger.error('Failed to connect to Meilisearch', err);
        }
    }

    async search(query: string, limit = 50): Promise<number[]> {
        const { hits } = await this.index.search(query, {
            attributesToRetrieve: ['id'],
            sort: ['score:desc', 'id:asc'],
            limit,
        });

        return hits.map(({ id }) => id as number);
    }

    async indexAnime(anime: AnimeEntity): Promise<void> {
        await this.index.addDocuments([this.toSearchDocument(anime)], { primaryKey: 'id' });
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
                const docs = animes.map(a => this.toSearchDocument(a));

                await this.index.addDocuments(docs, { primaryKey: 'id' });

                offset += animes.length;

                this.logger.log(`Indexed ${offset} animes`);
            }
        } while (animes.length >= BATCH);

        this.logger.log(`Indexed total ${offset} animes`);
    }

    private toSearchDocument(anime: AnimeEntity): AnimeSearchDocument {
        const titles: Record<string, string[]> = {};

        for (const { language, title } of (anime.titles ?? [])) {
            if (!titles[language]) {
                titles[language] = [];
            }

            titles[language].push(title);
        }

        return {
            id: anime.id,
            titles,
            score: anime.score,
        };
    }
}
