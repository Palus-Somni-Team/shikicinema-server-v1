import { IsOptional, IsString } from 'class-validator';

export class ContributionsQueryDto {
    @IsOptional()
    @IsString()
    uploader?: string;
}