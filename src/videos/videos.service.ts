import { Injectable } from '@nestjs/common';

import { VideosServiceInterface } from './videos-service.interface';

@Injectable()
export class VideosService implements VideosServiceInterface {
  async getAnimeLength(animeId: number): Promise<number> {
    return Promise.resolve(animeId);
  }
}
