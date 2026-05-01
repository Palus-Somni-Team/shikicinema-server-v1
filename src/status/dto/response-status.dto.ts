import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

import { StatusEnum } from '../types';

@Exclude()
export class ResponseStatusDto {
  @Expose()
  @IsEnum(StatusEnum)
  server: StatusEnum;

  @Expose()
  @IsEnum(StatusEnum)
  api: StatusEnum;
}
