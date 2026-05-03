import { AuthorsQueryDto, SearchQueryDto, VideoDto } from './dto';

export interface VideosServiceInterface {
  getAnimeLength(animeId: number): Promise<number>;

  getAuthors(query: AuthorsQueryDto): Promise<string[]>;

  search(query: SearchQueryDto): Promise<VideoDto[]>;
}
