import {
  IsInt,
  IsString,
  IsOptional,
  IsUrl,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Expose } from 'class-transformer';

import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

export class VideoDto {
  @IsInt()
  id: number;

  @IsString()
  @IsUrl()
  url: string;

  @Expose({ name: 'anime_id' })
  @IsInt()
  animeId: number;

  @IsInt()
  @IsPositive()
  episode: number;

  @IsString()
  @IsEnum(KindEnum)
  kind: KindEnum;

  @IsString()
  language: string;

  @IsString()
  @IsOptional()
  @IsEnum(QualityEnum)
  quality?: QualityEnum;

  @IsString()
  @IsOptional()
  author?: string;

  @Expose({ name: 'watches_count' })
  @IsInt()
  watchesCount: number;

  @IsString()
  uploader: string;

  @Expose({ name: 'anime_english' })
  @IsString()
  @IsOptional()
  animeEnglish?: string;

  @Expose({ name: 'anime_russian' })
  @IsString()
  @IsOptional()
  animeRussian?: string;
}
