import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AnimeSearchDto extends IntersectionType(AnimeFiltersDto, PaginationQueryDto) {
    @ApiProperty({
        description: 'Поиск по названию аниме',
        type: String,
        required: false,
        example: 'Ван-Пис',
    })
    @IsOptional()
    @IsString()
    name?: string;
}
