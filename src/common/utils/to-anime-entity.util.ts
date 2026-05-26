import { ShikimoriAnime } from '../../animes/types';
import { AnimeEntity } from '../../entities';

export function toAnimeEntity(anime: ShikimoriAnime, existing?: AnimeEntity | null): AnimeEntity {
    const entity = existing || new AnimeEntity(Number(anime.id));

    // обновляем поля, которые пришли от shikimori не пустыми
    if (anime.kind) entity.kind = anime.kind;
    if (anime.score) entity.score = anime.score;
    if (anime.rating) entity.rating = anime.rating;
    if (anime.status) entity.status = anime.status;
    if (anime.duration) entity.duration = anime.duration;
    if (anime.description) entity.description = anime.description;
    if (anime.studios?.length) entity.studios = anime.studios.map(({ name }) => name);
    if (anime.airedOn?.date) entity.airedOn = new Date(anime.airedOn.date);
    if (anime.nextEpisodeAt) entity.nextEpisodeAt = new Date(anime.nextEpisodeAt);
    if (anime.releasedOn?.date) entity.releasedOn = new Date(anime.releasedOn.date);

    // TODO: добавить пользовательские тэги

    return entity;
}
