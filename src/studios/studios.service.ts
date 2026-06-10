import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GetStudiosDto } from './dto';
import { StudioEntity } from '../entities';
import { MeilisearchService } from '../common/services/meilisearch';
import { toLimit } from '../common/utils/to-limit.util';

@Injectable()
export class StudiosService {
    constructor(
        @InjectRepository(StudioEntity)
        private readonly studioRepo: Repository<StudioEntity>,

        private readonly meilisearch: MeilisearchService,
    ) {}

    async find({ name, offset, limit }: GetStudiosDto) {
        let studios: StudioEntity[] = [];

        if (name) {
            const ids = await this.meilisearch.searchStudios(name, limit, offset);

            if (ids.length > 0) {
                const entities = await this.studioRepo.createQueryBuilder('studio')
                    .where('studio.id IN (:...ids)', { ids })
                    .getMany();

                const orderMap = new Map(ids.map((id, i) => [id, i]));

                studios = entities.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);
            }
        } else {
            studios = await this.studioRepo.find({
                order: { name: 'ASC' },
                skip: offset,
                take: toLimit(limit),
            });
        }

        return studios;
    }
}
