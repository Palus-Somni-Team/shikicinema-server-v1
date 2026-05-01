import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class ResponseStatusUptimeDto {
  @Expose()
  @IsString()
  server: string;

  @Expose()
  @IsString()
  api: string;
}
