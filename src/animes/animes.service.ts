import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LanguageCode } from 'iso-639-1';

import { AnimeEntity, AnimeTitleEntity } from '../entities';
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

    private addSortOrder(qb: SelectQueryBuilder<AnimeEntity>, dto: AnimeQueryDto | AnimeSearchDto): void {
        const sort = dto.sort || 'score';
        const order = dto.order || SortOrderEnum.ASC;
        const isAnimeQuery = dto instanceof AnimeQueryDto;

        switch (sort) {
            // сортируем по название на нужном языке с возрастающим приоритетом
            case 'name': {
                const { sortLang: lang = 'ru' } = dto;

                qb.addSelect(
                    `(SELECT t.title FROM anime_titles t
                        WHERE t.anime_id = anime.id
                            AND t.language = '${lang}'
                        ORDER BY t.priority ASC
                        LIMIT 1)`,
                    'name_sort',
                );
                qb.orderBy('name_sort', order);

                break;
            }

            // сортируем по рейтингу пользователя
            case 'user_score':
                if (isAnimeQuery && dto.scores?.length) {
                    const { scores, ids } = dto;
                    const cases = ids.map((id, i) => `WHEN ${id} THEN ${scores[i] ?? 0}`).join(' ');

                    qb.orderBy(`(CASE anime.id ${cases} END)`, order);
                }

                break;

            // сортируем по дате добавления в список
            case 'user_created':
                if (isAnimeQuery && dto.created?.length) {
                    const { created, ids } = dto;
                    const cases = ids
                        .map((id, i) => `WHEN ${id} THEN '${created[i] ?? '1900-01-01'}'::timestamptz`)
                        .join(' ');

                    qb.orderBy(`(CASE anime.id ${cases} END)`, order);
                }

                break;

            // сортируем по дате обновления в списоке
            case 'user_updated':
                if (isAnimeQuery && dto.updated?.length) {
                    const { updated, ids } = dto;
                    const cases = ids
                        .map((id, i) => `WHEN ${id} THEN '${updated[i] ?? '1900-01-01'}'::timestamptz`)
                        .join(' ');

                    qb.orderBy(`(CASE anime.id ${cases} END)`, order);
                }

                break;

            // сортировка для всех других полей
            default:
                qb.orderBy(`anime.${sort}`, order);
        }
    }

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
                this.addSortOrder(qb, dto);
            }
        } else {
            this.addSortOrder(qb, dto);
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
