import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { GenreEntity } from '../entities';
import { SortOrderEnum } from '../common/types';

@Injectable()
export class GenresService {
    constructor(
        @InjectRepository(GenreEntity)
        private readonly genreRepo: Repository<GenreEntity>,
    ) {}

    async findAll(): Promise<GenreEntity[]> {
        return this.genreRepo.find({ order: { name: SortOrderEnum.ASC } });
    }
}
