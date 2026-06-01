import {
    Entity,
    Column,
    PrimaryColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    JoinColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AnimeTitleEntity } from './anime-title.entity';
import { GenreEntity } from './genre.entity';
import { StudioEntity } from './studio.entity';

@Exclude()
@Entity('animes')
export class AnimeEntity {
    @Expose()
    @PrimaryColumn({ type: 'integer' })
    @ApiProperty({ description: 'ID аниме на Шикимори', example: 21 })
    id: number;

    @Expose()
    @Column('text', { array: true, default: '{}' })
    @ApiProperty({ example: ['Адапатация VN', 'Кемономими'] })
    tags: string[];

    @Expose()
    @Column({ type: 'varchar', length: 32, nullable: true })
    @ApiProperty({ example: 'tv' })
    kind: string | null;

    @Expose()
    @Column({ type: 'varchar', length: 16, nullable: true })
    @ApiProperty({ example: 'pg_13' })
    rating: string | null;

    @Expose()
    @Column({ type: 'float', nullable: true })
    @ApiProperty({ example: 8.5 })
    score: number | null;

    @Expose()
    @Column({ type: 'varchar', length: 32 })
    @ApiProperty({ example: 'released' })
    status: string;

    @Expose()
    @Column({ type: 'int', nullable: true })
    @ApiProperty({ description: 'Длитеность эпизода в минутах', example: 24 })
    duration: number | null;

    @Expose({ name: 'aired_on' })
    @Column({ type: 'timestamptz', nullable: true, name: 'aired_on' })
    @ApiProperty({ example: '1998-04-03T00:00:00' })
    airedOn: Date | null;

    @Expose({ name: 'released_on' })
    @Column({ type: 'timestamptz', nullable: true, name: 'released_on' })
    @ApiProperty({ example: '1998-04-03T00:00:00' })
    releasedOn: Date | null;

    @Expose({ name: 'next_episode_at' })
    @Column({ type: 'timestamptz', nullable: true, name: 'next_episode_at' })
    @ApiProperty({ example: '2026-06-01T12:00:00' })
    nextEpisodeAt: Date | null;

    @Expose()
    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Описание на русском' })
    description: string | null;

    @Expose()
    @ManyToMany(() => StudioEntity)
    @JoinTable({
        name: 'anime_studios',
        joinColumn: { name: 'anime_id' },
        inverseJoinColumn: { name: 'studio_id' },
    })
    studios!: StudioEntity[];

    @Expose()
    @OneToMany(() => AnimeTitleEntity, (title) => title.anime)
    @JoinColumn({ name: 'id', referencedColumnName: 'anime_id' })
    titles!: AnimeTitleEntity[];

    @Expose()
    @ManyToMany(() => GenreEntity, { cascade: true })
    @JoinTable({
        name: 'anime_genres',
        joinColumn: { name: 'anime_id' },
        inverseJoinColumn: { name: 'genre_id' },
    })
    genres!: GenreEntity[];

    @Expose({ name: 'created_at' })
    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @Expose({ name: 'updated_at' })
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;

    @Expose()
    @ApiProperty({ 
        example: { 
            avif: '/static/animes/21.avif',
            webp: '/static/animes/21.webp', 
            jpeg: '/static/animes/21.jpeg',
            placeholder: '/static/animes/21-placeholder.jpeg' 
        } 
    })
    get poster() {
        const base = `/static/animes/${this.id}`;

        return {
            avif: `${base}.avif`,
            webp: `${base}.webp`,
            jpeg: `${base}.jpeg`,
            placeholder: `${base}-placeholder.jpeg`,
        };
    }

    constructor(
        id: number,
        kind: string | null = null,
        rating: string | null = null,
        score: number | null = null,
        status: string = 'anons',
        duration: number | null = null,
        airedOn: Date | null = null,
        releasedOn: Date | null = null,
        nextEpisodeAt: Date | null = null,
        description: string | null = null,
        tags: string[] = [],
    ) {
        this.id = id;
        this.kind = kind;
        this.rating = rating;
        this.score = score;
        this.status = status;
        this.duration = duration;
        this.airedOn = airedOn;
        this.releasedOn = releasedOn;
        this.nextEpisodeAt = nextEpisodeAt;
        this.description = description;
        this.tags = tags;
    }
}