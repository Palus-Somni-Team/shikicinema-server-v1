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

import { AgeRatingEnum, AnimeKindEnum, AnimeSeasonEnum, AnimeStatusEnum } from '../types';
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
        description: 'Год начала (включительно)',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
        example: 2020,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    yearFrom?: number;

    @ApiProperty({
        description: 'Год окончания (включительно)',
        type: Number,
        required: false,
        minimum: 1900,
        maximum: 3000,
        example: 2025,
    })
    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    yearTo?: number;

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
        enum: ['id', 'score', 'aired_on', 'released_on', 'name', 'duration'],
        required: false,
        default: 'id',
    })
    @IsOptional()
    @IsIn(['id', 'score', 'aired_on', 'released_on', 'name', 'duration'])
    sort?: string = 'id';

    @ApiProperty({
        description: 'Порядок сортировки',
        enum: SortOrderEnum,
        required: false,
        default: SortOrderEnum.ASC,
    })
    @IsOptional()
    @IsEnum(SortOrderEnum)
    order?: SortOrderEnum = SortOrderEnum.ASC;
}
