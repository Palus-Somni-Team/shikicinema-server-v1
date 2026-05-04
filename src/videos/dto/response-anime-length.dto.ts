import { Exclude, Expose, Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

@Exclude()
export class ResponseAnimeLengthDto {
  @Expose()
  @IsInt()
  @Min(0)
  @Type(() => Number)
      length: number;
}
