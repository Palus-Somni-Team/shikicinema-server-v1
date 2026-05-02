import { AuthorsQueryDto } from './dto';

export interface VideosServiceInterface {
  getAnimeLength(animeId: number): Promise<number>;

  getAuthors(query: AuthorsQueryDto): Promise<string[]>;
}
