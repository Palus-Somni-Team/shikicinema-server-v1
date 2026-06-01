import { ShikimoriStudio } from '../../animes/types';
import { StudioEntity } from '../../entities';

export function toStudioEntity(
    studio: ShikimoriStudio,
    existing?: StudioEntity,
): StudioEntity {
    if (existing) {
        existing.name = studio.name;
        return existing;
    }

    return new StudioEntity(Number(studio.id), studio.name);
}
