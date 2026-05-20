import { IsOptional, IsISO6391 } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { LanguageCode } from 'iso-639-1';
import ISO6391 from 'iso-639-1';

export class GetTitlesQueryDto {
    @IsOptional()
    @IsISO6391()
    @ApiPropertyOptional({ enum: ISO6391.getAllCodes(), example: 'ru' })
    language?: LanguageCode;
}
