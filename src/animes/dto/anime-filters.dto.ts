import {
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
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
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @Type(() => Number)
    genres?: number[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    @IsPositive({ each: true })
    @Type(() => Number)
    studios?: number[];

    @IsOptional()
    @IsEnum(AnimeKindEnum)
    kind?: AnimeKindEnum;

    @IsOptional()
    @IsEnum(AnimeStatusEnum)
    status?: AnimeStatusEnum;

    @IsOptional()
    @IsString()
    @IsEnum(AgeRatingEnum)
    ageRating?: AgeRatingEnum;

    @IsOptional()
    @IsString()
    @IsEnum(AnimeSeasonEnum)
    season?: AnimeSeasonEnum;

    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    yearFrom?: number;

    @IsOptional()
    @IsInt()
    @Min(1900)
    @Max(3000)
    @Type(() => Number)
    yearTo?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(10)
    @Type(() => Number)
    scoreMin?: number;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    @Type(() => Number)
    scoreMax?: number;

    @IsOptional()
    @IsIn(['id', 'score', 'aired_on', 'released_on', 'name', 'duration'])
    sort?: string = 'id';

    @IsOptional()
    @IsEnum(SortOrderEnum)
    order?: SortOrderEnum = SortOrderEnum.ASC;
}
