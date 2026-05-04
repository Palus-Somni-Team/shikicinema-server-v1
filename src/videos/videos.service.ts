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
    return Promise.resolve(['Author1', 'Author2', 'Author3']);
  }

  async search(query: VideosSearchQueryDto): Promise<ResponseVideoDto[]> {
    return Promise.resolve([]);
  }

  async getByAnimeId(
    animeId: number,
    query: VideosQueryDto,
  ): Promise<ResponseVideoDto[]> {
    return Promise.resolve([]);
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
