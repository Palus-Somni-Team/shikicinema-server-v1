import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    IsOptional,
    IsIn,
    ValidateNested,
} from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';
import { AnimeUserRateDto } from './anime-user-rate.dto';
import type { AnimeQuerySortFieldsType } from '../types';
import { ANIME_QUERY_SORT_FIELDS } from '../types/anime-query-sort-fields.type';
import { Type } from 'class-transformer';

export class AnimeQueryDto extends AnimeFiltersDto {
    @ApiProperty({
        description: 'Аниме с пользовательскими данными для сортировки',
        type: [Object],
        required: true,
        example: [
            { id: 21, score: 9, created: '2019-10-17', updated: '2020-02-16' },
            { id: 20, score: 8, created: '2019-10-22' },
            { id: 1, score: 7 },
        ],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @ValidateNested({ each: true })
    @Type(() => AnimeUserRateDto)
    userRates!: AnimeUserRateDto[];

    @ApiProperty({
        description: 'Поле для сортировки',
        enum: ANIME_QUERY_SORT_FIELDS,
        required: false,
        default: 'score',
    })
    @IsOptional()
    @IsIn(ANIME_QUERY_SORT_FIELDS)
    override sort?: AnimeQuerySortFieldsType = 'score';
}
