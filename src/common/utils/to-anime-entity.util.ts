import { ShikimoriAnime } from '../../animes/types';
import { AnimeEntity } from '../../entities';

export function toAnimeEntity(anime: ShikimoriAnime) {
    const id = Number(anime.id);
    const genres = anime.genres?.map(({ name }) => name) ?? [];
    const studios = anime.studios?.map(({ name }) => name) ?? [];
    const airedOn = anime.airedOn?.date ? new Date(anime.airedOn.date) : null;
    const releasedOn = anime.releasedOn?.date ? new Date(anime.releasedOn.date) : null;
    const nextEpisodeAt = anime.nextEpisodeAt ? new Date(anime.nextEpisodeAt) : null;

    return new AnimeEntity(
        id,
        genres,
        anime.kind,
        anime.rating,
        anime.score,
        anime.status ?? 'anons',
        anime.duration,
        airedOn,
        releasedOn,
        nextEpisodeAt,
        anime.description,
        studios,
        [], // TODO: добавить пользовательские тэги
    );
}
