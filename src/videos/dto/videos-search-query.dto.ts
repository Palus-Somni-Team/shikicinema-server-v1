import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

import { VideosQueryDto } from './videos-query.dto';

export class VideosSearchQueryDto extends VideosQueryDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: 'Ванпис', type: 'string' })
    title?: string;
}
