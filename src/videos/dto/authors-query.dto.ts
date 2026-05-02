import {
  IsOptional,
  IsInt,
  IsString,
  MinLength,
  IsPositive,
} from 'class-validator';
import { Expose, Type } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AuthorsQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @Expose({ name: 'anime_id' })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  animeId?: number;
}
