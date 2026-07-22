import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ShikiAccessTokenDto {
    @Expose()
    @ApiProperty({ example: 'Bearer', type: 'string' })
    type!: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    token!: string;

    @Expose()
    @ApiProperty({ type: 'string' })
    refresh!: string;

    @Expose()
    @ApiProperty({ example: '2026-07-22T07:10:01.400Z', type: 'string' })
    expiresAt!: string;   
}
