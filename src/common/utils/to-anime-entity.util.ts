import {
    AgeRatingEnum,
    AnimeKindEnum,
    AnimeStatusEnum,
    ShikimoriAnime
} from '../../animes/types';
import { AnimeEntity } from '../../entities';

export function toAnimeEntity(anime: ShikimoriAnime, existing?: AnimeEntity | null): AnimeEntity {
    const entity = existing || new AnimeEntity(Number(anime.id));
    const status = anime.status ? anime.status as AnimeStatusEnum : AnimeStatusEnum.ANONS;

    // обновляем поля, которые пришли от shikimori не пустыми
    if (anime.kind) entity.kind = anime.kind as AnimeKindEnum;
    if (anime.score) entity.score = anime.score;
    if (anime.rating) entity.rating = anime.rating as AgeRatingEnum;
    if (anime.status) entity.status = status;
    if (anime.duration) entity.duration = anime.duration;
    if (anime.description) entity.description = anime.description;
    if (anime.episodes) entity.episodesTotal = anime.episodes;
    if (anime.airedOn?.date) entity.airedOn = new Date(anime.airedOn.date);
    if (anime.nextEpisodeAt) entity.nextEpisodeAt = new Date(anime.nextEpisodeAt);
    if (anime.releasedOn?.date) entity.releasedOn = new Date(anime.releasedOn.date);

    // TODO: добавить пользовательские тэги

    return entity;
}
