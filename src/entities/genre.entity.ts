import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { ShikimoriEntryType, ShikimoriGenreKindEnum } from '../animes/types';

@Exclude()
@Entity('genres')
export class GenreEntity {
    @Expose()
    @PrimaryColumn({ type: 'integer' })
    @ApiProperty({ example: 1 })
    id: number;

    @Expose()
    @Column({ type: 'varchar', length: 64 })
    @ApiProperty({ example: 'Action' })
    name: string;

    @Expose()
    @Column({ type: 'varchar', length: 64 })
    @ApiProperty({ example: 'Экшен' })
    russian: string;

    @Expose()
    @Column({ type: 'varchar', length: 16 })
    @ApiProperty({ example: 'genre' })
    kind: ShikimoriGenreKindEnum;

    @Exclude()
    @Column({ type: 'varchar', length: 8, name: 'entry_type', default: ShikimoriEntryType.ANIME })
    entryType: ShikimoriEntryType;

    constructor(
        id: number,
        name: string = '',
        russian: string = '',
        kind: ShikimoriGenreKindEnum = ShikimoriGenreKindEnum.GENRE,
        entryType: ShikimoriEntryType = ShikimoriEntryType.ANIME,
    ) {
        this.id = id;
        this.name = name;
        this.russian = russian;
        this.kind = kind;
        this.entryType = entryType;
    }
}
