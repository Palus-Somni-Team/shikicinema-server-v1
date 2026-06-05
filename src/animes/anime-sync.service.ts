import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Cron } from '@nestjs/schedule';
import { createHash } from 'crypto';
import { enUS } from 'date-fns/locale';
import { formatDate, formatDuration, intervalToDuration } from 'date-fns';

import { AnimeEntity, AnimeTitleEntity } from '../entities';
import { ShikimoriGQLService } from './shikimori-gql.service';
import { ShikimoriAnime, ShikimoriStudio } from './types';
import {
    getAnimeTitles,
    toAnimeEntity,
    toGenreEntity,
    toStudioEntity,
    waitAsync,
} from '../common/utils';
import { AlreadyProcessing, PosterNotFound } from '../domain';
import { AlertService } from '../common/services/alert';
import { MeilisearchService } from '../common/services/meilisearch';

@Injectable()
export class AnimeSyncService implements OnModuleInit {
    private readonly staticDir = process.env.SHIKICINEMA_API_V1_STATIC_DIR || '/var/www/static/';
    private readonly syncDelayMs = parseInt(process.env.SHIKICINEMA_API_V1_SYNC_DELAY_MS || '350');

    private readonly postersDir = path.join(this.staticDir, 'animes');
    private readonly studiosDir = path.join(this.staticDir, 'studios');

    private readonly logger = new Logger('ANIME SYNC');

    private readonly downloadedStudios = new Set<number>();

    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        @InjectRepository(AnimeTitleEntity)
        private readonly titleRepo: Repository<AnimeTitleEntity>,

        private readonly shikimoriGQL: ShikimoriGQLService,

        private readonly alert: AlertService,

        private readonly meilisearch: MeilisearchService,
    ) {}

    async onModuleInit() {
        sharp.cache(false);
        await fs.mkdir(this.postersDir, { recursive: true });
        await fs.mkdir(this.studiosDir, { recursive: true });
    }

    @Cron('0 7 * * *')
    async syncAll() {
        const start = Date.now();

        this.logger.log(`START ${formatDate(start, 'dd MMMM yyyy, HH:mm:ss O')}`);

        await this.syncAllPages();

        const duration = intervalToDuration({ start, end: Date.now() });

        this.logger.log(`END ${formatDuration(duration, { locale: enUS })}`);
    }

    async syncById(id: number): Promise<void> {
        const anime = await this.shikimoriGQL.fetchAnimeById(id);

        if (anime) {
            await this.syncAnimeMeta(anime);
            await this.savePoster(anime);

            for (const studio of (anime?.studios ?? [])) {
                await this.downloadStudioImage(studio);
            }
        }
    }

    private async syncAllPages(page = 1, limit = 50): Promise<void> {
        try {
            let totalSynced = 0;
            let animes: ShikimoriAnime[];

            do {
                const start = Date.now();

                animes = await this.shikimoriGQL.fetchAnimesPage(page, limit);

                for (const anime of animes) {
                    await this.syncAnimeMeta(anime);
                    await this.savePoster(anime);

                    for (const studio of (anime?.studios ?? [])) {
                        await this.downloadStudioImage(studio);
                    }

                    totalSynced++;
                }

                page++;

                if (animes.length > 0) {
                    const duration = formatDuration(intervalToDuration({ start, end: Date.now() })) ?? '<1s';

                    const firstId = animes[0].id;
                    const lastId = animes[animes.length - 1].id;

                    this.logger.log(`Synced page ${page} from ${firstId} - to ${lastId} (${duration}, total of ${animes.length} animes)`);
                }

                await waitAsync(this.syncDelayMs);
            } while (animes.length > 0);

            this.downloadedStudios.clear();

            // обновляем индексы для meilisearch
            await this.meilisearch.indexAllAnimes();

            this.logger.log(`Sync completed. Total synced: ${totalSynced}`);
        } catch (err) {
            this.alert.error('ANIME SYNC', `Failed to load page ${page}`, err);
        }
    }

    private async syncAnimeMeta(anime: ShikimoriAnime): Promise<void> {
        try {
            const existing = await this.animeRepo.findOne({
                where: { id: Number(anime.id) },
                relations: { genres: true },
            });

            const entity = toAnimeEntity(anime, existing);

            // обновляем жанры
            if (anime.genres?.length) {
                const genres = anime.genres.map((genre) => {
                    const existingGenre = existing?.genres?.find(({ id }) => Number(genre.id) === id);

                    return toGenreEntity(genre, existingGenre);
                });

                entity.genres = genres;
            }

            // обновляем студии
            if (anime.studios?.length) {
                const studios = anime.studios.map((studio) => {
                    const existingStudio = existing?.studios?.find(({ name }) => name === studio.name);

                    return toStudioEntity(studio, existingStudio);
                });
                entity.studios = studios;
            }

            // сохраняем само аниме со связями
            await this.animeRepo.save(entity);

            this.logger.log(`Updated anime fields for id ${anime.id}`);
        } catch (err) {
            this.logger.error(`Failed to update anime fields for id ${anime.id}`, err);
        }

        try {
            const titles = getAnimeTitles(anime);

            if (titles.length > 0) {
                await this.titleRepo.upsert(titles, ['animeId', 'title']);

                this.logger.log(`Updated titles for anime id ${anime.id}`);
            }
        } catch (err) {
            this.logger.error(`Failed to update titles for anime id ${anime.id}`, err);
        }
    }

    private async fetchImage(url: string): Promise<Buffer> {
        const headers = { 'User-Agent': 'Shikicinema/1.0' };
        const response = await fetch(url, { headers })
            .catch(() => { throw new PosterNotFound(url) });

        if (!response.ok) {
            throw new PosterNotFound(url);
        }

        return Buffer.from(await response.arrayBuffer());
    }

    private async isHashMatches(buffer: Buffer, existingPath: string): Promise<boolean> {
        const existingFile = await fs.readFile(existingPath).catch(() => null);
        const existingHash = existingFile && createHash('sha256').update(existingFile).digest('hex');

        if (!existingHash) return false;

        const newHash = createHash('sha256').update(buffer).digest('hex')

        return existingHash === newHash;
    }

    private async savePoster(anime: ShikimoriAnime): Promise<void> {
        try {
            const posterUrl = anime?.poster?.originalUrl;

            if (!posterUrl) {
                throw new PosterNotFound(`${anime.id} has no poster field (null)`);
            }

            const originalPath = path.join(this.postersDir, `${anime.id}.jpeg`);
            const avifPath = path.join(this.postersDir, `${anime.id}.avif`);
            const webpPath = path.join(this.postersDir, `${anime.id}.webp`);
            const placeholderPath = path.join(this.postersDir, `${anime.id}-placeholder.jpeg`);

            const posterImg = await this.fetchImage(posterUrl);

            const isHashMatches = await this.isHashMatches(posterImg, originalPath);

            if (isHashMatches) {
                this.logger.log(`Posters for anime "${anime.name}" (${anime.id}) up-to-date`);
            } else {
                const image = sharp(posterImg);
                const { width } = await image.metadata();

                Promise.all([
                    // webp
                    image.clone()
                        .resize({ width: Math.round(width * 0.35) })
                        .webp({ quality: 80 })
                        .toFile(webpPath),

                    // placeholder
                    image.clone()
                        .resize({ width: Math.round(width * 0.20) })
                        .jpeg({ quality: 40 })
                        .toFile(placeholderPath),

                    // avif
                    image.clone()
                        .avif({ quality: 80 })
                        .toFile(avifPath),

                    // оригинальный jpeg
                    fs.writeFile(originalPath, posterImg),
                ]).then(() => {
                    this.logger.log(`Posters downloaded for anime ${anime.id}`);
                }).catch(async (err) => {
                    this.logger.error(`Failed to process images for anime ${anime.id}:`, err);

                    try {
                        await fs.rm(originalPath);
                        await fs.rm(avifPath);
                        await fs.rm(webpPath);
                        await fs.rm(placeholderPath);
                    } catch (cleanUpErr) {
                        this.logger.error(`Error during clean up for ${anime.id}:`, cleanUpErr);
                    }
                }).finally(() => {
                    image.destroy();
                });
            }
        } catch (err) {
            if (err instanceof PosterNotFound) {
                this.logger.warn(err.message);
            } else {
                this.alert.error('ANIME SYNC', `Failed to download poster for ${anime.id}:`, err);
            }
        }
    }

    private async downloadStudioImage(studio: ShikimoriStudio): Promise<void> {
        const studioId = Number(studio.id);
        const imgUrl = studio?.imageUrl;

        try {
            if (this.downloadedStudios.has(studioId)) {
                throw new AlreadyProcessing(`"${studio.name}" (${studioId})`)
            } else {
                this.downloadedStudios.add(Number(studioId));
            }

            if (!imgUrl) {
                throw new PosterNotFound(`${studioId} has no imageUrl field (null)`);
            }

            const originalPath = path.join(this.studiosDir, `${studioId}.jpeg`);

            const studioImg = await this.fetchImage(imgUrl);

            const isSameHash = await this.isHashMatches(studioImg, originalPath);

            if (isSameHash) {
                this.logger.log(`Studio image "${studio.name}" (${studioId}) up-to-date`);
            } else {
                await fs.writeFile(originalPath, studioImg);

                this.logger.log(`Studio image "${studio.name}" (${studioId}) downloaded`);
            }
        } catch (err) {
            if (err instanceof AlreadyProcessing) { /* do not log this */ }
            else if (err instanceof PosterNotFound) {
                this.logger.warn(`Studio image not found: "${studio.name}" (${studioId})`);
            } else {
                this.alert.error('ANIME SYNC', `Studio image "${imgUrl}" (${studioId})`, err);
            }
        }
    }
}
