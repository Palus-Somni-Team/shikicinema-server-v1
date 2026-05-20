import { ShikimoriAnime } from '../../animes/types';
import { AnimeTitleEntity } from '../../entities';
import { guessLanguage } from './guess-language.util';

export function getAnimeTitles(anime: ShikimoriAnime): AnimeTitleEntity[] {
    const unique = new Map<string, AnimeTitleEntity>();
    const animeId = Number(anime.id);
    const synonyms = anime.synonyms ?? [];
    const titles: AnimeTitleEntity[] = [];

    if (anime.russian) {
        titles.push(new AnimeTitleEntity(animeId, anime.russian, 'ru'));
    }

    if (anime.licenseNameRu) {
        titles.push(new AnimeTitleEntity(animeId, anime.licenseNameRu, 'ru', 1));
    }

    if (anime.english) {
        titles.push(new AnimeTitleEntity(animeId, anime.english, 'en'));
    }

    if (anime.name) {
        titles.push(new AnimeTitleEntity(animeId, anime.name, 'en', 1));
    }

    if (anime.japanese) {
        titles.push(new AnimeTitleEntity(animeId, anime.japanese, 'ja'));
    }

    for (const synonym of synonyms) {
        const language = guessLanguage(synonym);

        if (language) {
            titles.push(new AnimeTitleEntity(animeId, synonym, language, 2));
        }
    }

    for (const title of titles) {
        const key = `${title.animeId}:${title.title}`;
        const existing = unique.get(key);

        if (!existing || existing.priority > title.priority) {
            unique.set(key, title);
        }
    }

    return [...unique.values()];
}
