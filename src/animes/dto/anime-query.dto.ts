import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    IsInt,
    IsPositive,
    IsOptional,
    IsNumber,
    IsString,
    IsIn,
} from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';
import type { AnimeQuerySortFieldsType } from '../types';
import { ANIME_QUERY_SORT_FIELDS } from '../types/anime-query-sort-fields.type';

export class AnimeQueryDto extends AnimeFiltersDto {
    @ApiProperty({
        description: 'ID аниме для массовой фильтрации/сортировки',
        type: [Number],
        minItems: 1,
        maxItems: 1000,
        example: [8, 21, 223],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @IsInt({ each: true })
    @IsPositive({ each: true })
    ids!: number[];

    @ApiProperty({
        description: 'Оценки пользователя (из ids по индексу)',
        type: [Number],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    scores?: number[];

    @ApiProperty({
        description: 'Даты добавления в список (из ids по индексу)',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    created?: string[];

    @ApiProperty({
        description: 'Даты обновления в списке (из ids по индексу)',
        type: [String],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    updated?: string[];

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
