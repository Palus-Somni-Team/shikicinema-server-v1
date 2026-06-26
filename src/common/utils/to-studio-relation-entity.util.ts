import { ShikimoriStudio } from '../../animes/types';
import { AnimeStudioEntity } from '../../entities';

export function toStudioRelationEntity(animeId: number | string, studio: ShikimoriStudio): AnimeStudioEntity {
    return { animeId: Number(animeId), studioId: Number(studio.id) }
}
