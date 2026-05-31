import {
    IsArray,
    ArrayMaxSize,
    ArrayMinSize,
    IsInt,
    IsPositive,
} from 'class-validator';

import { AnimeFiltersDto } from './anime-filters.dto';

export class AnimeQueryDto extends AnimeFiltersDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(1000)
    @IsInt({ each: true })
    @IsPositive({ each: true })
    ids!: number[];
}
