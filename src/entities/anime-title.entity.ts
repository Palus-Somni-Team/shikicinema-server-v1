import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AnimeEntity } from './anime.entity';
import type { LanguageCode } from 'iso-639-1';

@Exclude()
@Entity('anime_titles')
export class AnimeTitleEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    id!: number;

    @Index()
    @Column({ type: 'integer', name: 'anime_id' })
    @Expose({ name: 'anime_id' })
    @ApiProperty({ example: 21 })
    animeId: number;

    @Column({ type: 'varchar', length: 512 })
    @Expose()
    @ApiProperty({ example: 'Ванпис' })
    title: string;

    @Column({ type: 'varchar', length: 2 })
    @Expose()
    @ApiProperty({ example: 'ru' })
    language: LanguageCode;

    @Column({ type: 'smallint', default: 0 })
    @Expose()
    @ApiProperty({ example: 0 })
    priority: number;

    @ManyToOne(() => AnimeEntity)
    @JoinColumn({ name: 'anime_id', referencedColumnName: 'id' })
    anime!: AnimeEntity;

    constructor(animeId: number, title: string, language: LanguageCode, priority = 0) {
        this.animeId = animeId;
        this.title = title;
        this.language = language;
        this.priority = priority;
    }
}
