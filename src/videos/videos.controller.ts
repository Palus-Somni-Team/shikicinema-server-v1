import { Controller, Get, Logger, Param } from '@nestjs/common';

import { VideosService } from './videos.service';
import { GetByAnimeIdDto, ResponseAnimeLengthDto } from './dto';

@Controller('shikivideos')
export class VideosController {
  constructor(
    private readonly _logger: Logger,
    private readonly _videos: VideosService,
  ) {}

  @Get(':animeId/length')
  async getAnimeLength(
    @Param() params: GetByAnimeIdDto,
  ): Promise<ResponseAnimeLengthDto> {
    const length = await this._videos.getAnimeLength(params.animeId);

    return { length };
  }
}
