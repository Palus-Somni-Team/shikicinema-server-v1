import { LanguageCode } from 'iso-639-1';

import { AnimeTitleEntity } from '../../entities';

export function selectAnimeName(titles: AnimeTitleEntity[], lang: LanguageCode) {
    return titles
        ?.filter(({ language }) => language === lang)
        ?.sort((a, b) => a.priority - b.priority)
        ?.at(0)
        ?.title ?? null
}
