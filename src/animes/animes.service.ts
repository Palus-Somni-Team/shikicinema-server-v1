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
        const userRates = dto instanceof AnimeQueryDto && dto?.userRates;

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
            case 'user_score': {
                if (userRates) {
                    const cases = userRates.map(({ id, score = 0 }) => `WHEN ${id} THEN ${score}`).join(' ');

                    qb.orderBy(`(CASE anime.id ${cases} END)`, order);

                    qb.addSelect(
                        `(SELECT t.title FROM anime_titles t WHERE t.anime_id = anime.id AND t.language = 'en' ORDER BY t.priority ASC LIMIT 1)`,
                        'name_sort',
                    );
                    qb.addOrderBy('name_sort', 'ASC');

                    qb.addOrderBy('anime.id', 'ASC');
                }

                break;
            }

            // сортируем по дате добавления в список
            case 'user_created':
                if (userRates) {
                    const cases = userRates
                        .map(({ id, created = '1900-01-01' }) => `WHEN ${id} THEN '${created}'::timestamptz`)
                        .join(' ');
    
                    qb.orderBy(`(CASE anime.id ${cases} END)`, order);
                }

                break;

            // сортируем по дате обновления в списоке
            case 'user_updated':
                if (userRates) {
                    const cases = userRates
                        .map(({ id, updated = '1900-01-01' }) => `WHEN ${id} THEN '${updated}'::timestamptz`)
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
        return this.animeRepo.createQueryBuilder('anime')
            .leftJoinAndSelect('anime.titles', 'title')
            .leftJoinAndSelect('anime.genres', 'genre')
            .leftJoinAndSelect('anime.studios', 'studio')
            .addSelect('anime.episodesAired')
            .where('anime.id = :id', { id })
            .getOneOrFail();
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

            const animeIds = await this.meilisearch.searchAnimes(dto.name, limit);

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

        if ('userRates' in dto && dto.userRates?.length) {
            const ids = dto.userRates.map(({ id }) => id);

            qb.andWhere('anime.id IN (:...ids)', { ids });
        }

        if (dto.genres?.length) {
            qb.andWhere(
                `anime.id IN (
                    SELECT agen.anime_id FROM anime_genres agen 
                    WHERE agen.genre_id IN (:...genres) 
                    GROUP BY agen.anime_id 
                    HAVING COUNT(DISTINCT agen.genre_id) = :genresCount
                )`,
                { genres: dto.genres, genresCount: dto.genres.length }
            );
        }

        if (dto.studios?.length) {
            qb.andWhere(
                `anime.id IN (
                    SELECT asub.anime_id FROM anime_studios asub 
                    WHERE asub.studio_id IN (:...studios) 
                    GROUP BY asub.anime_id 
                    HAVING COUNT(DISTINCT asub.studio_id) = :studiosCount
                )`,
                { studios: dto.studios, studiosCount: dto.studios.length }
            );
        }

        if (dto.kinds?.length) {
            qb.andWhere('anime.kind IN (:...kind)', { kind: dto.kinds });
        }
        
        if (dto.statuses?.length) {
            qb.andWhere('anime.status IN (:...status)', { status: dto.statuses });
        }

        if (dto.ageRatings?.length) {
            qb.andWhere('anime.rating IN (:...ageRating)', { ageRating: dto.ageRatings });
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

        if (dto.durationMin) {
            qb.andWhere('anime.duration >= :durationMin', { durationMin: dto.durationMin });
        }

        if (dto.durationMax) {
            qb.andWhere('anime.duration <= :durationMax', { durationMax: dto.durationMax });
        }

        if (dto.episodesMin) {
            qb.andWhere('anime.episodes_total >= :episodesMin', { episodesMin: dto.episodesMin });
        }

        if (dto.episodesMax) {
            qb.andWhere('anime.episodes_total <= :episodesMax', { episodesMax: dto.episodesMax });
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
