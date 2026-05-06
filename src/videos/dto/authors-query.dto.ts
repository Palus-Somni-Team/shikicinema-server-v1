import {
    IsOptional,
    IsInt,
    IsString,
    MinLength,
    IsPositive,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AuthorsQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsString()
    @MinLength(1)
    @ApiPropertyOptional({ example: 'jam', type: 'string' })
    name?: string;

    @Expose({ name: 'anime_id' })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    @ApiPropertyOptional({ example: 21, type: 'integer' })
    animeId?: number;
}
