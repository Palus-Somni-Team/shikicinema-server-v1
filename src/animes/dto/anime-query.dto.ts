import { ApiProperty } from '@nestjs/swagger';
import {
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    IsInt,
    IsPositive,
} from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';

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
}
