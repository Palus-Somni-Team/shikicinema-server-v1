import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';

import { VideosServiceInterface } from './videos-service.interface';
import {
    AuthorsQueryDto,
    VideosQueryDto,
    VideosSearchQueryDto,
    CreateVideoDto,
    QualityEnum,
} from './dto';
import { VideoEntity } from '../entities';
import { DuplicateUrlException } from '../domain';

@Injectable()
export class VideosService implements VideosServiceInterface {
    constructor(
        @InjectRepository(VideoEntity)
        private readonly videoRepo: Repository<VideoEntity>,
    ) {}

    async getAnimeLength(animeId: number): Promise<number> {
        const result = await this.videoRepo
            .createQueryBuilder('video')
            .select('MAX(video.episode)', 'max')
            .where('video.anime_id = :animeId', { animeId })
            .getRawOne<{ max: string | null }>();

        return parseInt(result?.max ?? '0', 10);
    }

    async getAuthors(query: AuthorsQueryDto): Promise<string[]> {
        const qb = this.videoRepo
            .createQueryBuilder('video')
            .select('DISTINCT video.author', 'author')
            .where('video.author IS NOT NULL');

        if (query.name) {
            qb.andWhere('video.author ILIKE :name', { name: `%${query.name}%` });
        }

        if (query.animeId) {
            qb.andWhere('video.anime_id = :animeId', { animeId: query.animeId });
        }

        qb.orderBy('video.author', 'ASC').limit(query.limit);

        const rows = await qb.getRawMany<{ author: string }>();

        return rows.map((r) => r.author);
    }

    async search(query: VideosSearchQueryDto): Promise<VideoEntity[]> {
        const {
            title,
            episode,
            kind,
            lang,
            quality,
            author,
            uploader,
            offset = 0,
            limit = 50,
        } = query;

        const qb = this.videoRepo.createQueryBuilder('video');

        if (title) {
            qb.where(
                '(video.anime_english ILIKE :title OR video.anime_russian ILIKE :title)',
                { title: `%${title}%` },
            );
        }

        if (episode) qb.andWhere('video.episode = :episode', { episode });
        if (kind) qb.andWhere('video.kind = :kind', { kind });
        if (lang) qb.andWhere('video.language = :lang', { lang });
        if (quality) qb.andWhere('video.quality = :quality', { quality });
        if (author)
            qb.andWhere('video.author ILIKE :author', { author: `%${author}%` });
        if (uploader) qb.andWhere('video.uploader = :uploader', { uploader });

        return qb
            .orderBy('video.episode', 'ASC')
            .skip(offset)
            .take(limit)
            .getMany();
    }

    async getByAnimeId(
        animeId: number,
        query: VideosQueryDto,
    ): Promise<VideoEntity[]> {
        const {
            episode,
            kind,
            lang,
            quality,
            author,
            uploader,
            offset = 0,
            limit = 50,
        } = query;

        const where: Record<string, any> = { animeId };

        if (episode) where.episode = episode;
        if (kind) where.kind = kind;
        if (lang) where.language = lang;
        if (quality) where.quality = quality;
        if (uploader) where.uploader = uploader;

        return this.videoRepo.find({
            where: author ? { ...where, author: ILike(`%${author}%`) } : where,
            order: { episode: 'ASC' },
            skip: offset,
            take: limit,
        });
    }

    async createVideo(video: CreateVideoDto, uploader: string): Promise<VideoEntity> {
        try {
            const entity = new VideoEntity(
                video.animeId,
                video.episode,
                video.url,
                video.kind,
                video.language,
                uploader,
                video.author,
                video.quality ?? QualityEnum.UNKNOWN,
                0,
                video.animeEnglish,
                video.animeRussian,
            );

            return await this.videoRepo.save(entity);
        } catch (error) {
            if (
                error instanceof QueryFailedError &&
                error?.driverError?.code === '23505'
            ) {
                throw new DuplicateUrlException(video.url);
            }
            throw error;
        }
    }
}
