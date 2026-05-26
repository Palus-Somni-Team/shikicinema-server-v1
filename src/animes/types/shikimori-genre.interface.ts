import { ShikimoriEntryType } from './shikimori-entry-type.enum';
import { ShikimoriGenreKindEnum } from './shikimori-genre-kind.enum';

export interface ShikimoriGenre {
    id: string;
    name: string;
    russian: string;
    kind: ShikimoriGenreKindEnum;
    entryType: ShikimoriEntryType;
}
