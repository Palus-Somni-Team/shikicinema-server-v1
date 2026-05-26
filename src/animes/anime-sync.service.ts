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
import { ShikimoriAnime } from './types';
import {
    getAnimeTitles,
    toAnimeEntity,
    toGenreEntity,
    waitAsync,
} from '../common/utils';
import { PosterHashMatch, PosterNotFound } from '../domain';

@Injectable()
export class AnimeSyncService implements OnModuleInit {
    private readonly postersDir = process.env.SHIKICINEMA_API_V1_STATIC_DIR || '/var/www/static/animes';
    private readonly syncDelayMs = parseInt(process.env.SHIKICINEMA_API_V1_SYNC_DELAY_MS || '350');
    private readonly logger = new Logger('ANIME SYNC');

    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        @InjectRepository(AnimeTitleEntity)
        private readonly titleRepo: Repository<AnimeTitleEntity>,

        private readonly shikimoriGQL: ShikimoriGQLService,
    ) {}

    async onModuleInit() {
        sharp.cache(false);
        await fs.mkdir(this.postersDir, { recursive: true });
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
        }
    }

    private async syncAllPages(page = 1, limit = 50): Promise<void> {
        let totalSynced = 0;
        let animes: ShikimoriAnime[];

        do {
            const start = Date.now();

            animes = await this.shikimoriGQL.fetchAnimesPage(page, limit);

            for (const anime of animes) {
                await this.syncAnimeMeta(anime);
                await this.savePoster(anime);

                totalSynced++;
            }

            page++;

            if (animes.length > 0) {
                const duration = formatDuration(intervalToDuration({ start, end: Date.now() }));

                const firstId = animes[0].id;
                const lastId = animes[animes.length - 1].id;

                this.logger.log(`Synced page ${page} from ${firstId} - to ${lastId} (${duration}, total of ${animes.length} animes)`);
            }

            await waitAsync(this.syncDelayMs);
        } while (animes.length > 0);

        this.logger.log(`Sync completed. Total synced: ${totalSynced}`);
    }

    private async syncAnimeMeta(anime: ShikimoriAnime): Promise<void> {
        try {
            const existing = await this.animeRepo.findOne({
                where: { id: Number(anime.id) },
                relations: { genres: true },
            });

            const entity = toAnimeEntity(anime, existing);

            if (anime.genres?.length) {
                const genres = anime.genres.map((genre) => {
                    const existingGenre = existing?.genres?.find(({ id }) => Number(genre.id) === id);

                    return toGenreEntity(genre, existingGenre);
                });

                entity.genres = genres;
            }

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

    private async savePoster(anime: ShikimoriAnime): Promise<void> {
        try {
            const posterUrl = anime?.poster?.originalUrl;

            if (!posterUrl) {
                throw new PosterNotFound(anime.id);
            }

            const originalPath = path.join(this.postersDir, `${anime.id}.jpeg`);
            const avifPath = path.join(this.postersDir, `${anime.id}.avif`);
            const webpPath = path.join(this.postersDir, `${anime.id}.webp`);
            const placeholderPath = path.join(this.postersDir, `${anime.id}-placeholder.jpeg`);

            const response = await fetch(posterUrl, {
                headers: { 'User-Agent': 'Shikicinema/1.0' },
            }).catch(() => { throw new PosterNotFound(anime.id); });

            if (!response.ok) {
                this.logger.warn(`Poster for ${anime.id} returned HTTP ${response.status}, skipping`);
                throw new PosterNotFound(anime.id);
            }

            const buffer = Buffer.from(await response.arrayBuffer());
            const newHash = createHash('sha256').update(buffer).digest('hex');

            const oldBuffer = await fs.readFile(originalPath).catch(() => null);
            const oldHash = oldBuffer && createHash('sha256').update(oldBuffer).digest('hex');

            if (newHash === oldHash) {
                throw new PosterHashMatch(originalPath.toString());
            }

            const image = sharp(buffer);
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
                fs.writeFile(originalPath, buffer),
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

        } catch (err) {
            if (err instanceof PosterHashMatch) {
                this.logger.log(`Posters for anime ${anime.id} up-to-date - skipping`);
            } else if (err instanceof PosterNotFound) {
                this.logger.warn(err.message);
            } else {
                this.logger.error(`Failed to download poster for ${anime.id}:`, err);
            }
        }
    }
}
