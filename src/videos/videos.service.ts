import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, QueryFailedError, Repository } from 'typeorm';

import { VideosServiceInterface } from './videos-service.interface';
import {
    AuthorsQueryDto,
    VideosQueryDto,
    VideosSearchQueryDto,
    CreateVideoDto,
    QualityEnum,
    ContributionsQueryDto,
} from './dto';
import { VideoEntity } from '../entities';
import { DuplicateUrlException } from '../domain';
import { toLimit } from '../common/utils';
import { AlertService } from '../common/services/alert';

@Injectable()
export class VideosService implements VideosServiceInterface {
    constructor(
        @InjectRepository(VideoEntity)
        private readonly videoRepo: Repository<VideoEntity>,

        private readonly alert: AlertService,
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

        qb.orderBy('video.author', 'ASC');

        if (isFinite(query.limit)) {
            qb.limit(query.limit);
        }

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
    
        const qb = this.videoRepo.createQueryBuilder('video')
            .leftJoinAndSelect('video.anime', 'anime')
            .leftJoinAndSelect('anime.titles', 'title');

        if (title) {
            qb.andWhere(
                'video.animeId IN (SELECT at.anime_id FROM anime_titles at WHERE at.title ILIKE :title)', 
                { title: `%${title}%` }
            );
        }

        if (episode) qb.andWhere('video.episode = :episode', { episode });
        if (kind) qb.andWhere('video.kind = :kind', { kind });
        if (lang) qb.andWhere('video.language = :lang', { lang });
        if (quality) qb.andWhere('video.quality = :quality', { quality });
        if (author) qb.andWhere('video.author ILIKE :author', { author: `%${author}%` });
        if (uploader) qb.andWhere('video.uploader = :uploader', { uploader });
        if (isFinite(limit)) qb.take(limit);

        return qb.orderBy('video.episode', 'ASC').skip(offset).getMany();
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
            take: toLimit(limit),
        });
    }

    async createVideo(video: CreateVideoDto, uploader: string): Promise<VideoEntity> {
        return this.videoRepo.manager.transaction(async (manager) => {
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
                );
    
                const saved = await manager.save(VideoEntity, entity);
                const uploaded = await manager.findOne(VideoEntity, {
                    where: { id: saved.id },
                });
    
                if (!uploaded) {
                    throw new InternalServerErrorException('Failed to load created video');
                }
    
                return uploaded;
            } catch (error) {
                if (
                    error instanceof QueryFailedError &&
                    error?.driverError?.code === '23505'
                ) {
                    throw new DuplicateUrlException(video.url);
                }

                this.alert.error('VIDEO SERVICE', 'Video upload failed', error);
                throw error;
            }
        });
    }

    async getContributions(query: ContributionsQueryDto): Promise<number> {
        const where: Record<string, any> = {};

        if (query.uploader) {
            where.uploader = query.uploader;
        }

        return await this.videoRepo.count({ where });
    }
}
