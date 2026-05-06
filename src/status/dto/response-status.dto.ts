import { Exclude, Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { StatusEnum } from '../types';

@Exclude()
export class ResponseStatusDto {
    @Expose()
    @IsEnum(StatusEnum)
    @ApiProperty({ enum: StatusEnum, example: StatusEnum.ONLINE })
    server: StatusEnum;

    @Expose()
    @IsEnum(StatusEnum)
    @ApiProperty({ enum: StatusEnum, example: StatusEnum.ONLINE })
    api: StatusEnum;
}
