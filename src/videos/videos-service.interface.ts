import { VideoEntity } from '../entities';
import {
    AuthorsQueryDto,
    VideosQueryDto,
    VideosSearchQueryDto,
    CreateVideoDto,
} from './dto';

export interface VideosServiceInterface {
    getAnimeLength(animeId: number): Promise<number>;

    getAuthors(query: AuthorsQueryDto): Promise<string[]>;

    search(query: VideosSearchQueryDto): Promise<VideoEntity[]>;

    getByAnimeId(animeId: number, query: VideosQueryDto): Promise<VideoEntity[]>;

    createVideo(video: CreateVideoDto, uploader: string): Promise<VideoEntity>;
}
