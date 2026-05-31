import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LanguageCode } from 'iso-639-1';

import { AnimeEntity, AnimeTitleEntity, GenreEntity } from '../entities';
import { AnimeQueryDto } from './dto';
import { SortOrderEnum } from '../common/types';

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

    async getByQuery(dto: AnimeQueryDto): Promise<AnimeEntity[]> {
        const qb = this.animeRepo.createQueryBuilder('anime')
            .leftJoinAndSelect('anime.titles', 'title')
            .leftJoinAndSelect('anime.genres', 'genre');

        if (dto.ids?.length) {
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

        const sortField = dto.sortBy === 'name' ? 'title.title' : `anime.${dto.sortBy}`;

        qb.orderBy(sortField, dto.order || SortOrderEnum.ASC);

        return qb.getMany();
    }
}
