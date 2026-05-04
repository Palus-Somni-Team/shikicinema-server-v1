import {
  IsInt,
  IsString,
  IsOptional,
  IsUrl,
  IsPositive,
  IsEnum,
} from 'class-validator';
import { Exclude, Expose } from 'class-transformer';

import { KindEnum } from './kind.enum';
import { QualityEnum } from './quality.enum';

@Exclude()
export class ResponseVideoDto {
  @Expose()
  @IsInt()
  id: number;

  @Expose()
  @IsString()
  @IsUrl()
  url: string;

  @Expose({ name: 'anime_id' })
  @IsInt()
  animeId: number;

  @Expose()
  @IsInt()
  @IsPositive()
  episode: number;

  @Expose()
  @IsString()
  @IsEnum(KindEnum)
  kind: KindEnum;

  @Expose()
  @IsString()
  language: string;

  @Expose()
  @IsString()
  @IsOptional()
  @IsEnum(QualityEnum)
  quality?: QualityEnum;

  @Expose()
  @IsString()
  @IsOptional()
  author?: string | null;

  @Expose({ name: 'watches_count' })
  @IsInt()
  watchesCount: number;

  @Expose()
  @IsString()
  uploader: string | null;

  @Expose({ name: 'anime_english' })
  @IsString()
  @IsOptional()
  animeEnglish?: string;

  @Expose({ name: 'anime_russian' })
  @IsString()
  @IsOptional()
  animeRussian?: string;
}
