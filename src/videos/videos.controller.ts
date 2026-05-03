import { Controller, Get, Logger, Param, Query } from '@nestjs/common';

import { VideosService } from './videos.service';
import {
  GetByAnimeIdDto,
  ResponseAnimeLengthDto,
  AuthorsQueryDto,
  VideosQueryDto,
  VideoDto,
  VideosSearchQueryDto,
} from './dto';

@Controller('shikivideos')
export class VideosController {
  constructor(
    private readonly _logger: Logger,
    private readonly _videos: VideosService,
  ) {}

  @Get('authors')
  async getAuthors(
    @Query() query: AuthorsQueryDto,
  ): Promise<ResponseAnimeLengthDto> {
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
  async search(@Query() query: VideosSearchQueryDto): Promise<VideoDto[]> {
    return await this._videos.search(query);
  }

  @Get(':animeId')
  async getByAnimeId(
    @Param() params: GetByAnimeIdDto,
    @Query() query: VideosQueryDto,
  ): Promise<VideoDto[]> {
    return await this._videos.getByAnimeId(params.animeId, query);
  }
}
