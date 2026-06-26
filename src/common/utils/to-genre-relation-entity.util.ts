import { ShikimoriGenre } from '../../animes/types';
import { AnimeGenreEntity } from '../../entities';

export function toGenreRelationEntity(animeId: string | number, genre: ShikimoriGenre): AnimeGenreEntity {
    return { animeId: Number(animeId), genreId: Number(genre.id) }
}
