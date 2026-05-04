import { Controller, Get, Logger, Param, Query, Post } from '@nestjs/common';

import { VideosService } from './videos.service';
import {
  GetByAnimeIdDto,
  ResponseAnimeLengthDto,
  AuthorsQueryDto,
  VideosQueryDto,
  ResponseVideoDto,
  VideosSearchQueryDto,
  CreateVideoDto,
} from './dto';
import { plainToInstance } from 'class-transformer';

@Controller('shikivideos')
export class VideosController {
  constructor(
    private readonly _logger: Logger,
    private readonly _videos: VideosService,
  ) {}

  @Post()
  async createVideo(@Query() video: CreateVideoDto): Promise<ResponseVideoDto> {
    const createdVideo = await this._videos.createVideo(video);

    return plainToInstance(ResponseVideoDto, createdVideo);
  }

  @Get('authors')
  async getAuthors(@Query() query: AuthorsQueryDto): Promise<string[]> {
    return await this._videos.getAuthors(query);
  }

  @Get(':animeId/length')
  async getAnimeLength(
    @Param() params: GetByAnimeIdDto,
  ): Promise<ResponseAnimeLengthDto> {
    const length = await this._videos.getAnimeLength(params.animeId);

    return { length };
  }

  @Get('search')
  async search(
    @Query() query: VideosSearchQueryDto,
  ): Promise<ResponseVideoDto[]> {
    const results = await this._videos.search(query);

    return plainToInstance(ResponseVideoDto, results);
  }

  @Get(':animeId')
  async getByAnimeId(
    @Param() params: GetByAnimeIdDto,
    @Query() query: VideosQueryDto,
  ): Promise<ResponseVideoDto[]> {
    const anime = await this._videos.getByAnimeId(params.animeId, query);

    return plainToInstance(ResponseVideoDto, anime);
  }
}
