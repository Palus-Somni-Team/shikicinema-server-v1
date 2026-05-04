import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { VideosServiceInterface } from './videos-service.interface';
import {
  AuthorsQueryDto,
  VideosQueryDto,
  ResponseVideoDto,
  VideosSearchQueryDto,
  CreateVideoDto,
  QualityEnum,
} from './dto';
import { VideoEntity } from '../entities';

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

  async search(query: VideosSearchQueryDto): Promise<ResponseVideoDto[]> {
    return Promise.resolve([]);
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

    const qb = this.videoRepo
      .createQueryBuilder('video')
      .where('video.anime_id = :animeId', { animeId });

    if (episode) qb.andWhere('video.episode = :episode', { episode });
    if (kind) qb.andWhere('video.kind = :kind', { kind });
    if (lang) qb.andWhere('video.language = :lang', { lang });
    if (quality) qb.andWhere('video.quality = :quality', { quality });
    if (author)
      qb.andWhere('video.author ILIKE :author', { author: `%${author}%` });
    if (uploader) qb.andWhere('video.uploader = :uploader', { uploader });

    const videos = await qb
      .orderBy('video.episode', 'ASC')
      .skip(offset)
      .take(limit)
      .getMany();

    return videos;
  }

  async createVideo(video: CreateVideoDto): Promise<ResponseVideoDto> {
    return Promise.resolve({
      id: 1,
      url: video.url,
      animeId: video.animeId,
      episode: video.episode,
      kind: video.kind,
      language: video.language,
      quality: video.quality ?? QualityEnum.UNKNOWN,
      author: video.author ?? null,
      watchesCount: 0,
      uploader: '12345',
      animeEnglish: video?.animeEnglish ?? '',
      animeRussian: video?.animeRussian ?? '',
    });
  }
}
