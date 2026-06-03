export { VideoEntity } from './video.entity';
export { AccessTokenEntity } from './access-token.entity';
export { UserEntity } from './user.entity';
export { AnimeEntity } from './anime.entity';
export { AnimeTitleEntity } from './anime-title.entity';
export { GenreEntity } from './genre.entity';
export { StudioEntity } from './studio.entity';

import { VideoEntity } from './video.entity';
import { AccessTokenEntity } from './access-token.entity';
import { UserEntity } from './user.entity';
import { AnimeEntity } from './anime.entity';
import { AnimeTitleEntity } from './anime-title.entity';
import { GenreEntity } from './genre.entity';
import { StudioEntity } from './studio.entity';

import { StudioPosterSubscriber } from './subscribers';

export const entities = [
    VideoEntity,
    AccessTokenEntity,
    UserEntity,
    AnimeEntity,
    AnimeTitleEntity,
    GenreEntity,
    StudioEntity,
];

export const subscribers = [
    StudioPosterSubscriber,
];
