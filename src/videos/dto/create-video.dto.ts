import {
    IsString,
    IsInt,
    IsPositive,
    IsOptional,
    MaxLength,
    IsEnum,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

export class CreateVideoDto {
    @IsString()
    @MaxLength(2048)
    @ApiProperty({ example: 'https://youtube.com/embed/dQw4w9WgXcQ', type: 'string' })
    url: string;

    @Expose({ name: 'anime_id' })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @ApiProperty({ example: 21, type: 'integer' })
    animeId: number;

    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @ApiProperty({ example: 666, type: 'integer' })
    episode: number;

    @IsEnum(KindEnum)
    @ApiProperty({ example: KindEnum.SUBTITLES, enum: KindEnum })
    kind: KindEnum;

    @IsString()
    @ApiProperty({ example: 'ua', type: 'string' })
    language: string;

    @IsString()
    @IsOptional()
    @MaxLength(256)
    @ApiPropertyOptional({ example: 'MC Entertainment', type: 'string' })
    author?: string;

    @IsOptional()
    @IsEnum(QualityEnum)
    @ApiPropertyOptional({ example: QualityEnum.VHS, enum: QualityEnum })
    quality?: QualityEnum;

    @Expose({ name: 'anime_english' })
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'One Piece', type: 'string', deprecated: true })
    animeEnglish?: string;

    @Expose({ name: 'anime_russian' })
    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ example: 'Ванпис', type: 'string', deprecated: true })
    animeRussian?: string;
}
