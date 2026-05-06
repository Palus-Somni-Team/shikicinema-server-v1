import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ContributionsQueryDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ example: '278015', type: 'string' })
    uploader?: string;
}