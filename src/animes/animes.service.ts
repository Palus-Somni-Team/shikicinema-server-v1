import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageCode } from 'iso-639-1';

import { AnimeEntity, AnimeTitleEntity, GenreEntity } from '../entities';
import { AnimeQueryDto, AnimeSearchDto } from './dto';
import { SortOrderEnum } from '../common/types';
import { toLimit } from '../common/utils';

@Injectable()
export class AnimesService {
    constructor(
        @InjectRepository(AnimeEntity)
        private readonly animeRepo: Repository<AnimeEntity>,

        @InjectRepository(AnimeTitleEntity)
        private readonly titleRepo: Repository<AnimeTitleEntity>,
    ) {}

    async findById(id: number): Promise<AnimeEntity | null> {
        return this.animeRepo.findOne({
            where: { id },
            relations: { titles: true, genres: true },
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
            .leftJoinAndSelect('anime.genres', 'genre');

        if ('ids' in dto && dto.ids?.length) {
            qb.andWhere('anime.id IN (:...ids)', { ids: dto.ids });
        }

        if (dto.genreIds?.length) {
            qb.andWhere('genre.id IN (:...genreIds)', { genreIds: dto.genreIds });
        }

        if (dto.studios?.length) {
            qb.andWhere('anime.studios && ARRAY[:...studios]', { studios: dto.studios });
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
            const year = dto.yearFrom || dto.yearTo || new Date().getFullYear();
            const months = { winter: [1,2,3], spring: [4,5,6], summer: [7,8,9], fall: [10,11,12] }[dto.season];

            qb.andWhere('EXTRACT(MONTH FROM anime.aired_on) IN (:...months)', { months });
            qb.andWhere('EXTRACT(YEAR FROM anime.aired_on) = :year', { year });
        }

        if (dto.yearFrom) {
            qb.andWhere('EXTRACT(YEAR FROM anime.aired_on) >= :yearFrom', { yearFrom: dto.yearFrom });
        }

        if (dto.yearTo) {
            qb.andWhere('EXTRACT(YEAR FROM anime.aired_on) <= :yearTo', { yearTo: dto.yearTo });
        }

        if (dto.scoreMin) {
            qb.andWhere('anime.score >= :scoreMin', { scoreMin: dto.scoreMin });
        }

        if (dto.scoreMax) {
            qb.andWhere('anime.score <= :scoreMax', { scoreMax: dto.scoreMax });
        }

        if ('name' in dto && dto.name) {
            qb.andWhere(
                'anime.id IN (SELECT t.anime_id FROM anime_titles t WHERE t.title ILIKE :name)',
                { name: `%${dto.name}%` }
            );
        }

        if ('offset' in dto) {
            qb.skip(dto.offset || 0);
        }

        if ('limit' in dto) {
            qb.take(toLimit(dto.limit));
        }

        const sortField = dto.sortBy === 'name' ? 'title.title' : `anime.${dto.sortBy}`;

        qb.orderBy(sortField, dto.order || SortOrderEnum.ASC);

        return qb.getMany();
    }
}
