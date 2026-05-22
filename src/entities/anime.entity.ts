import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AnimeTitleEntity } from './anime-title.entity';

@Exclude()
@Entity('animes')
export class AnimeEntity {
    @PrimaryColumn({ type: 'integer' })
    @Expose()
    @ApiProperty({ description: 'ID аниме на Шикимори', example: 21 })
    id: number;

    @Column('text', { array: true, default: '{}' })
    @Expose()
    @ApiProperty({ example: ['Драма', 'Фэнтези'] })
    genres: string[];

    @Column('text', { array: true, default: '{}' })
    @Expose()
    @ApiProperty({ example: ['Адапатация VN', 'Кемономими'] })
    tags: string[];

    @Column({ type: 'varchar', length: 32, nullable: true })
    @Expose()
    @ApiProperty({ example: 'tv' })
    kind: string | null;

    @Column({ type: 'varchar', length: 16, nullable: true })
    @Expose()
    @ApiProperty({ example: 'pg_13' })
    rating: string | null;

    @Column({ type: 'float', nullable: true })
    @Expose()
    @ApiProperty({ example: 8.5 })
    score: number | null;

    @Column({ type: 'varchar', length: 32 })
    @Expose()
    @ApiProperty({ example: 'released' })
    status: string;

    @Column({ type: 'int', nullable: true })
    @Expose()
    @ApiProperty({ description: 'Длитеность эпизода в минутах', example: 24 })
    duration: number | null;

    @Column({ type: 'timestamptz', nullable: true, name: 'aired_on' })
    @Expose({ name: 'aired_on' })
    @ApiProperty({ example: '1998-04-03T00:00:00' })
    airedOn: Date | null;

    @Column({ type: 'timestamptz', nullable: true, name: 'released_on' })
    @Expose({ name: 'released_on' })
    @ApiProperty({ example: '1998-04-03T00:00:00' })
    releasedOn: Date | null;

    @Column({ type: 'timestamptz', nullable: true, name: 'next_episode_at' })
    @Expose({ name: 'next_episode_at' })
    @ApiProperty({ example: '2026-06-01T12:00:00' })
    nextEpisodeAt: Date | null;

    @Column({ type: 'text', nullable: true })
    @Expose()
    @ApiProperty({ description: 'Описание на русском' })
    description: string | null;

    @Column('text', { array: true, nullable: true })
    @Expose()
    @ApiProperty({ example: ['Sunrise'] })
    studios: string[];

    @OneToMany(() => AnimeTitleEntity, (title) => title.anime)
    @JoinColumn({ name: 'id', referencedColumnName: 'anime_id' })
    titles!: AnimeTitleEntity[];

    @CreateDateColumn({ name: 'created_at' })
    @Expose({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    @Expose({ name: 'updated_at' })
    updatedAt!: Date;

    constructor(
        id: number,
        genres: string[],
        kind: string | null = null,
        rating: string | null = null,
        score: number | null = null,
        status: string = 'anons',
        duration: number | null = null,
        airedOn: Date | null = null,
        releasedOn: Date | null = null,
        nextEpisodeAt: Date | null = null,
        description: string | null = null,
        studios: string[] = [],
        tags: string[] = [],
    ) {
        this.id = id;
        this.genres = genres;
        this.kind = kind;
        this.rating = rating;
        this.score = score;
        this.status = status;
        this.duration = duration;
        this.airedOn = airedOn;
        this.releasedOn = releasedOn;
        this.nextEpisodeAt = nextEpisodeAt;
        this.description = description;
        this.studios = studios;
        this.tags = tags;
    }
}