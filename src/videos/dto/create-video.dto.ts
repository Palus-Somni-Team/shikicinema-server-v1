import {
    IsString,
    IsInt,
    IsPositive,
    IsOptional,
    MaxLength,
    IsEnum,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

export class CreateVideoDto {
    @IsString()
    @MaxLength(2048)
    url: string;

    @Expose({ name: 'anime_id' })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    animeId: number;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    episode: number;

    @IsEnum(KindEnum)
    kind: KindEnum;

    @IsString()
    language: string;

    @IsString()
    @IsOptional()
    @MaxLength(256)
    author?: string;

    @IsOptional()
    @IsEnum(QualityEnum)
    quality?: QualityEnum;

    @Expose({ name: 'anime_english' })
    @IsString()
    @IsOptional()
    animeEnglish?: string;

    @Expose({ name: 'anime_russian' })
    @IsString()
    @IsOptional()
    animeRussian?: string;
}
