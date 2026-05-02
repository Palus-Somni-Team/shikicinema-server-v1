import { IsOptional, IsInt, Min, Max, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Max(1000)
  @Type(() => Number)
  limit?: number = 50;
}
