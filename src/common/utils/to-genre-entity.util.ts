import { ShikimoriGenre } from '../../animes/types';
import { GenreEntity } from '../../entities';

export function toGenreEntity(g: ShikimoriGenre, existing?: GenreEntity): GenreEntity {
    const id = Number(g.id);
    const genre = existing ?? new GenreEntity(id);

    if (g.name) genre.name = g.name;
    if (g.kind) genre.kind = g.kind;
    if (g.russian) genre.russian = g.russian;
    if (g.entryType) genre.entryType = g.entryType;

    return genre;
}
