import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    IsInt,
    IsPositive,
    IsOptional,
    IsString,
    IsIn,
    Min,
    Max,
    IsEnum,
    IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import ISO6391 from 'iso-639-1';

import {
    AgeRatingEnum,
    ANIME_SORT_FIELDS,
    AnimeKindEnum,
    AnimeSeasonEnum,
    AnimeStatusEnum,
} from '../types';
import type { AnimeSortFieldsType } from '../types'
import { SortOrderEnum } from '../../common/types';

export class AnimeFiltersDto {
    @ApiProperty({
        description: 'ID жанров для фильтрации',
        type: [Number],
        required: false,
        example: [1, 8, 24],
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @Type(() => Number)
    genres?: number[];

    @ApiProperty({
        description: 'ID студий для фильтрации',
        type: [Number],
        required: false,
        example: [18, 14],
    })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @Type(() => Number)
    studios?: number[];

    @ApiProperty({
        description: 'Тип аниме',
        enum: AnimeKindEnum,
        required: false,
        example: AnimeKindEnum.MUSIC,
    })
    @IsOptional()
    @IsEnum(AnimeKindEnum)
    kind?: AnimeKindEnum;

    @ApiProperty({
        description: 'Статус выхода',
        enum: AnimeStatusEnum,
        required: false,
        example: AnimeStatusEnum.ONGOING,
    })
    @IsOptional()
    @IsEnum(AnimeStatusEnum)
    status?: AnimeStatusEnum;

    @ApiProperty({
        description: 'Возрастной рейтинг',
        enum: AgeRatingEnum,
        required: false,
        example: 'pg_13',
    })
    @IsOptional()
    @IsString()
    @IsEnum(AgeRatingEnum)
    ageRating?: AgeRatingEnum;

    @ApiProperty({
        description: 'Сезон',
        enum: AnimeSeasonEnum,
        required: false,
        example: AnimeSeasonEnum.FALL,
    })
    @IsOptional()
    @IsString()
    @IsEnum(AnimeSeasonEnum)
    season?: AnimeSeasonEnum;

    @ApiProperty({
        description: 'Начало даты показа',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    airedFrom?: number;

    @ApiProperty({
        description: 'Конец даты показа',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    airedTo?: number;

    @ApiProperty({
        description: 'Начало даты выхода',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    releasedFrom?: number;

    @ApiProperty({
        description: 'Конец даты выхода',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    releasedTo?: number;

    @ApiProperty({
        description: 'Минимальная оценка',
        type: Number,
        required: false,
        minimum: 0,
        maximum: 10,
        example: 7.5,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    scoreMin?: number;

    @ApiProperty({
        description: 'Максимальная оценка',
        type: Number,
        required: false,
        minimum: 1,
        maximum: 10,
        example: 9.5,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    @Type(() => Number)
    scoreMax?: number;

    @ApiProperty({
        description: 'Поле для сортировки',
        enum: ANIME_SORT_FIELDS,
        required: false,
        default: 'score',
    })
    @IsOptional()
    @IsIn(ANIME_SORT_FIELDS)
    sort?: string = 'score';

    @ApiProperty({
        description: 'Язык для сортировки по названию (только для sort=name)',
        required: false,
        enum: ISO6391.getAllCodes(),
        default: 'ru',
    })
    @IsOptional()
    @IsEnum(ISO6391.getAllCodes())
    sortLang?: string = 'ru';

    @ApiProperty({
        description: 'Порядок сортировки',
        enum: SortOrderEnum,
        required: false,
        default: SortOrderEnum.ASC,
    })
    @IsOptional()
    @IsEnum(SortOrderEnum)
    order?: SortOrderEnum;
}
