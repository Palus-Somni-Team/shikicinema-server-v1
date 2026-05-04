import { Injectable } from '@nestjs/common';

import { VideosServiceInterface } from './videos-service.interface';
import {
  AuthorsQueryDto,
  VideosQueryDto,
  ResponseVideoDto,
  VideosSearchQueryDto,
  CreateVideoDto,
} from './dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class VideosService implements VideosServiceInterface {
  async getAnimeLength(animeId: number): Promise<number> {
    return Promise.resolve(animeId);
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
      anime_id: video.animeId,
      episode: video.episode,
      kind: video.kind,
      language: video.language,
      quality: video.quality ?? null,
      author: video.author ?? null,
      watches_count: 0,
      uploader: '12345',
      anime_english: video?.animeEnglish ?? null,
      anime_russian: video?.animeRussian ?? null,
    });
  }
}
