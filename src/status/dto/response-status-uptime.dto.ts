import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Exclude()
export class ResponseStatusUptimeDto {
    @Expose()
    @IsString()
    @ApiProperty({ type: 'string', example: '12 дней 4 часа 23 минуты 43 секунды' })
    server: string;

    @Expose()
    @IsString()
    @ApiProperty({ type: 'string', example: '1 час 14 минут 3 секунды' })
    api: string;
}
