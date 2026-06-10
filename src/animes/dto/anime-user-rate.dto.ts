import { ApiProperty } from '@nestjs/swagger';
import {
    IsInt,
    IsISO8601,
    IsOptional,
    IsPositive,
    Max,
    Min,
} from 'class-validator';

export class AnimeUserRateDto {
    @ApiProperty({
        description: 'ID аниме',
        example: 21,
    })
    @IsInt()
    @IsPositive()
    id!: number;

    @ApiProperty({
        description: 'Оценка пользователя',
        required: false,
        example: 9,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(10)
    score?: number;

    @ApiProperty({
        description: 'Дата добавления в список',
        required: false,
        example: '2019-10-17T14:42:06.121+03:00',
    })
    @IsOptional()
    @IsISO8601()
    created?: string;

    @ApiProperty({
        description: 'Дата обновления в списке',
        required: false,
        example: '2020-02-16T19:32:34.257+03:00',
    })
    @IsOptional()
    @IsISO8601()
    updated?: string;
}
