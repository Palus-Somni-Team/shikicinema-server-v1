import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageCode } from 'iso-639-1';

import { AnimeEntity, AnimeTitleEntity, GenreEntity } from '../entities';
import { AnimeQueryDto, AnimeSearchDto } from './dto';
import { SortOrderEnum } from '../common/types';
import { toLimit } from '../common/utils';
import { SEASON_MONTHS } from './types';
import { MeilisearchService } from '../common/services/meilisearch';

@Injectable()
export class AnimesService {
    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        @InjectRepository(AnimeTitleEntity)
        private readonly titleRepo: Repository<AnimeTitleEntity>,

        private readonly meilisearch: MeilisearchService,
    ) {}

    async findById(id: number): Promise<AnimeEntity | null> {
        return this.animeRepo.findOne({
            where: { id },
            relations: { titles: true, genres: true, studios: true },
        });
    }

    async findTitlesById(id: number, language?: LanguageCode): Promise<AnimeTitleEntity[]> {
        return this.titleRepo.find({
            where: { animeId: id, ...(language && { language }) },
            order: { priority: 'ASC' },
        });
    }

    async getByQuery(dto: AnimeQueryDto | AnimeSearchDto): Promise<AnimeEntity[]> {
        const qb = this.animeRepo.createQueryBuilder('anime')
            .leftJoinAndSelect('anime.titles', 'title')
            .leftJoinAndSelect('anime.genres', 'genre')
            .leftJoinAndSelect('anime.studios', 'studio');

        const sort = dto?.sort ?? 'id';
        const sortField = sort === 'name' ? 'title.title' : `anime.${sort}`;

        if ('name' in dto && dto.name) {
            const limit = 'limit' in dto ? toLimit(dto.limit) : 50;

            const animeIds = await this.meilisearch.search(dto.name, limit);

            if (animeIds.length === 0) {
                return [];
            }

            qb.andWhere('anime.id IN (:...animeIds)', { animeIds });

            if (!dto?.sort) {
                qb.addSelect(`ARRAY_POSITION(ARRAY[${animeIds.join(',')}]::integer[], anime.id)`, 'meili_rank');
                qb.orderBy('meili_rank', 'ASC');
            } else {
                qb.orderBy(sortField, dto.order || SortOrderEnum.ASC);
            }
        } else {
            qb.orderBy(sortField, dto.order || SortOrderEnum.ASC);
        }

        if ('ids' in dto && dto.ids?.length) {
            qb.andWhere('anime.id IN (:...ids)', { ids: dto.ids });
        }

        if (dto.genres?.length) {
            qb.andWhere(
                'anime.id IN (SELECT agen.anime_id FROM anime_genres agen WHERE agen.genre_id IN (:...genres))',
                { genres: dto.genres }
            );
        }

        if (dto.studios?.length) {
            qb.andWhere(
                'anime.id IN (SELECT asub.anime_id FROM anime_studios asub WHERE asub.studio_id IN (:...studios))',
                { studios: dto.studios }
            );
        }

        if (dto.kind) {
            qb.andWhere('anime.kind = :kind', { kind: dto.kind });
        }

        if (dto.status) {
            qb.andWhere('anime.status = :status', { status: dto.status });
        }

        if (dto.ageRating) {
            qb.andWhere('anime.rating = :ageRating', { ageRating: dto.ageRating });
        }

        if (dto.season) {
            const months = SEASON_MONTHS[dto.season];

            qb.andWhere('EXTRACT(MONTH FROM anime.aired_on) IN (:...months)', { months });
        }

        if (dto.airedFrom) {
            qb.andWhere('EXTRACT(YEAR FROM anime.aired_on) >= :airedFrom', { airedFrom: dto.airedFrom });
        }

        if (dto.airedTo) {
            qb.andWhere('EXTRACT(YEAR FROM anime.aired_on) <= :airedTo', { airedTo: dto.airedTo });
        }

        if (dto.releasedFrom) {
            qb.andWhere('EXTRACT(YEAR FROM anime.released_on) >= :releasedFrom', { releasedFrom: dto.releasedFrom });
        }

        if (dto.releasedTo) {
            qb.andWhere('EXTRACT(YEAR FROM anime.released_on) <= :releasedTo', { releasedTo: dto.releasedTo });
        }

        if (dto.scoreMin) {
            qb.andWhere('anime.score >= :scoreMin', { scoreMin: dto.scoreMin });
        }

        if (dto.scoreMax) {
            qb.andWhere('anime.score <= :scoreMax', { scoreMax: dto.scoreMax });
        }

        if (dto.scoreMin || dto.scoreMax) {
            qb.andWhere('anime.score IS NOT NULL');
        }

        if ('offset' in dto) {
            qb.skip(dto.offset || 0);
        }

        if ('limit' in dto) {
            qb.take(toLimit(dto.limit));
        }

        return qb.getMany();
    }
}
