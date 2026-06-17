import { AnimeEntity } from '../../../../entities';
import { AnimeSearchDocument } from '../../../types';

export function animeToSearchDoc(anime: AnimeEntity): AnimeSearchDocument {
    const titles: Record<string, string[]> = {};

    for (const { language, title } of (anime.titles ?? [])) {
        if (!titles[language]) {
            titles[language] = [];
        }

        titles[language].push(title);
    }

    return {
        id: anime.id,
        titles,
        score: anime.score,
        poster: anime.poster.jpeg,
    };
}
