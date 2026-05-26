import { ShikimoriDate } from './shikimori-date.interface';
import { ShikimoriGenre } from './shikimori-genre.interface';
import { ShikimoriPoster } from './shikimori-poster.interface';
import { ShikimoriRelated } from './shikimori-related.interface';
import { ShikimoriStudio } from './shikimori-studio.interface';
import { ShikimoriVideo } from './shikimori-video.interface';

export interface ShikimoriAnime {
    id: string;
    name: string;
    russian: string | null;
    licenseNameRu: string | null;
    english: string | null;
    japanese: string | null;
    synonyms: string[] | null;
    kind: string;
    rating: string | null;
    score: number | null;
    status: string | null;
    duration: number | null;
    description: string | null;
    url: string | null;
    airedOn: ShikimoriDate | null;
    releasedOn: ShikimoriDate | null;
    nextEpisodeAt: string | null;
    genres: ShikimoriGenre[] | null;
    studios: ShikimoriStudio[] | null;
    related: ShikimoriRelated[] | null;
    videos: ShikimoriVideo[] | null;
    poster: ShikimoriPoster | null;
}
