import {
  AuthorsQueryDto,
  VideosQueryDto,
  ResponseVideoDto,
  VideosSearchQueryDto,
  CreateVideoDto,
} from './dto';

export interface VideosServiceInterface {
  getAnimeLength(animeId: number): Promise<number>;

  getAuthors(query: AuthorsQueryDto): Promise<string[]>;

  search(query: VideosSearchQueryDto): Promise<ResponseVideoDto[]>;

  getByAnimeId(animeId: number, query: VideosQueryDto): Promise<ResponseVideoDto[]>;

  createVideo(video: CreateVideoDto): Promise<ResponseVideoDto>;
}
