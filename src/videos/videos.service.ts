import { Injectable } from '@nestjs/common';

import { VideosServiceInterface } from './videos-service.interface';
import { AuthorsQueryDto } from './dto';

@Injectable()
export class VideosService implements VideosServiceInterface {
  async getAnimeLength(animeId: number): Promise<number> {
    return Promise.resolve(animeId);
  }

  async getAuthors(query: AuthorsQueryDto): Promise<string[]> {
    return Promise.resolve(['Author1', 'Author2', 'Author3']);
  }
}
