import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AnimeSearchDto extends IntersectionType(AnimeFiltersDto, PaginationQueryDto) {
    @IsOptional()
    @IsString()
    name?: string;
}
