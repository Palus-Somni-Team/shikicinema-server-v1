import { LanguageCode } from 'iso-639-1';

import { AnimeTitleEntity } from '../../entities';

export function selectAnimeName(titles: AnimeTitleEntity[], lang: LanguageCode, prior = 0) {
    return titles
        ?.filter(({ language }) => language === lang)
        ?.filter(({ priority }) => priority === prior)
        ?.at(0)
        ?.title ?? null
}
