import {
  AuthorsQueryDto,
  VideosQueryDto,
  VideoDto,
  VideosSearchQueryDto,
} from './dto';

export interface VideosServiceInterface {
  getAnimeLength(animeId: number): Promise<number>;

  getAuthors(query: AuthorsQueryDto): Promise<string[]>;

  search(query: VideosSearchQueryDto): Promise<VideoDto[]>;

  getByAnimeId(animeId: number, query: VideosQueryDto): Promise<VideoDto[]>;
}
