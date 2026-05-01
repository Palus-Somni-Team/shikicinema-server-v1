import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, IsNumber, IsPositive } from 'class-validator';

@Exclude()
export class GetByAnimeIdDto {
  @Expose()
  @IsNumber()
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  animeId: number;
}
