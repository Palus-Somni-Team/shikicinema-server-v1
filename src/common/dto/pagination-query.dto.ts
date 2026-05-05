import { IsOptional, IsInt, Min, Max, IsPositive } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class PaginationQueryDto {
    @IsOptional()
    @IsInt()
    @Min(0)
    @Type(() => Number)
    offset?: number = 0;

    @IsOptional()
    @Transform(({ value }) => value === 'all' ? Infinity : Number(value))
    @IsPositive()
    limit?: number = 50;
}
