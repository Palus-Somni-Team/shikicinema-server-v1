import {
    EntitySubscriberInterface,
    EventSubscriber,
} from 'typeorm';
import path from 'path';
import { access, constants } from 'fs/promises';

import { StudioEntity } from '../studio.entity';

@EventSubscriber()
export class StudioPosterSubscriber implements EntitySubscriberInterface<StudioEntity> { 
    private readonly staticDir = process.env.SHIKICINEMA_API_V1_STATIC_DIR || '/var/www/static';
    private readonly shikicinemaDomain = process.env.SHIKICINEMA_API_V1_DOMAIN || '/';
    private readonly cache = new Map<number, string | null>();

    listenTo() {
        return StudioEntity;
    }

    async afterLoad(entity: StudioEntity) {
        if (this.cache.has(entity.id)) {
            entity.poster = this.cache.get(entity.id) ?? null;
        } else {
            const filePath = path.join(this.staticDir, 'studios', `${entity.id}.jpeg`);

            try {
                const poster = `${this.shikicinemaDomain}static/studios/${entity.id}.jpeg`;

                await access(filePath, constants.R_OK);

                this.cache.set(entity.id, poster);
                entity.poster = poster;
            } catch {
                this.cache.set(entity.id, null);
                entity.poster = null;
            }
        }
    }
}
