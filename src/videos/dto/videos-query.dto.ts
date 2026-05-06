import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsInt,
    Min,
    IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

export class VideosQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    @ApiPropertyOptional({ example: 15, type: 'integer' })
    episode?: number;

    @IsOptional()
    @IsString()
    @IsEnum(KindEnum)
    @ApiPropertyOptional({ example: KindEnum.ORIGINAL, enum: KindEnum })
    kind?: KindEnum;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'ja', type: 'string' })
    lang?: string;

    @IsOptional()
    @IsString()
    @IsEnum(QualityEnum)
    @ApiPropertyOptional({ example: QualityEnum.UNKNOWN, enum: QualityEnum })
    quality?: QualityEnum;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '9й Неизвестный', type: 'string' })
    author?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '1', type: 'string' })
    uploader?: string;
}
