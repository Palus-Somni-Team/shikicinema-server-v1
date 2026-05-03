import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

export class VideosQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  episode?: number;

  @IsOptional()
  @IsString()
  @IsEnum(KindEnum)
  kind?: KindEnum;

  @IsOptional()
  @IsString()
  lang?: string;

  @IsOptional()
  @IsString()
  @IsEnum(QualityEnum)
  quality?: QualityEnum;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  uploader?: string;
}
