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
    VirtualColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { AnimeTitleEntity } from './anime-title.entity';
import { GenreEntity } from './genre.entity';
import { StudioEntity } from './studio.entity';
import { AgeRatingEnum, AnimeKindEnum, AnimeStatusEnum } from '../animes/types';

@Exclude()
@Entity('animes')
export class AnimeEntity {
    @Expose()
    @PrimaryColumn({ type: 'integer' })
    @ApiProperty({ description: 'ID аниме на Шикимори', example: 21 })
    id: number;

    @Expose()
    @Column('text', { array: true, default: '{}' })
    @ApiProperty({
        description: 'Список пользовательских тегов (WIP)',
        example: ['Адапатация VN', 'Кемономими'],
    })
    tags: string[];

    @Expose()
    @Column({ type: 'enum', enum: AnimeKindEnum, nullable: true })
    @ApiProperty({ example: AnimeKindEnum.TV_SPECIAL, enum: AnimeKindEnum })
    kind: AnimeKindEnum | null;

    @Expose()
    @Column({ type: 'enum', enum: AgeRatingEnum, nullable: true })
    @ApiProperty({ example: AgeRatingEnum.PG13, enum: AgeRatingEnum })
    rating: AgeRatingEnum | null;

    @Expose()
    @Column({ type: 'real', nullable: true })
    @ApiProperty({ example: 8.5 })
    score: number | null;

    @Expose()
    @Column({ type: 'enum', enum: AnimeStatusEnum, nullable: true })
    @ApiProperty({ example: 'released', enum: AnimeStatusEnum  })
    status: AnimeStatusEnum;

    @Expose()
    @Column({ type: 'int', nullable: true })
    @ApiProperty({ description: 'Длитеность эпизода в минутах', example: 24 })
    duration: number | null;

    @Expose({ name: 'aired_on' })
    @Column({ type: 'timestamptz', nullable: true, name: 'aired_on' })
    @ApiProperty({ name: 'aired_on', description: 'Дата начала показа' })
    airedOn: Date | null;

    @Expose({ name: 'released_on' })
    @Column({ type: 'timestamptz', nullable: true, name: 'released_on' })
    @ApiProperty({ name: 'released_on', description: 'Дата конца показа' })
    releasedOn: Date | null;

    @Expose({ name: 'next_episode_at' })
    @Column({ type: 'timestamptz', nullable: true, name: 'next_episode_at' })
    @ApiProperty({ name: 'next_episode_at', description: 'Дата следующего эпизода' })
    nextEpisodeAt: Date | null;

    @Expose()
    @Column({ type: 'text', nullable: true })
    @ApiProperty({ description: 'Описание на русском', type: String })
    description: string | null;

    @Expose({ name: 'episodes_total' })
    @Column({ type: 'int', nullable: true, name: 'episodes_total' })
    @ApiProperty({ description: 'Количество эпизодов', example: 12 })
    episodesTotal: number | null;

    @Expose({ name: 'episodes_aired' })
    @VirtualColumn({
        type: 'int',
        select: false,
        // TODO: если когда-то ShikiVideos переименуется, исправить!
        query: (alias) => `(SELECT COUNT(DISTINCT episode)::int FROM "ShikiVideos" WHERE anime_id = ${alias}.id)`,
    })
    @ApiProperty({ description: 'Количество эпизодов с загруженными сериями (поле доступно только в поиске по id)' })
    episodesAired!: number;

    @Expose()
    @ManyToMany(() => StudioEntity)
    @JoinTable({
        name: 'anime_studios',
        joinColumn: { name: 'anime_id' },
        inverseJoinColumn: { name: 'studio_id' },
    })
    @ApiProperty({ description: 'Список участвовавших в создании студий', type: StudioEntity })
    studios!: StudioEntity[];

    @Expose()
    @OneToMany(() => AnimeTitleEntity, (title) => title.anime)
    @JoinColumn({ name: 'id', referencedColumnName: 'anime_id' })
    @ApiProperty({ description: 'Список названий на разных языках', type: AnimeTitleEntity })
    titles!: AnimeTitleEntity[];

    @Expose()
    @ManyToMany(() => GenreEntity, { cascade: true })
    @JoinTable({
        name: 'anime_genres',
        joinColumn: { name: 'anime_id' },
        inverseJoinColumn: { name: 'genre_id' },
    })
    @ApiProperty({ description: 'Список жанров из Шикимори', type: GenreEntity })
    genres!: GenreEntity[];

    @Expose({ name: 'created_at' })
    @CreateDateColumn({ name: 'created_at' })
    @ApiProperty({ description: 'Дата первой синхронизации с Шикимори' })
    createdAt!: Date;

    @Expose({ name: 'updated_at' })
    @UpdateDateColumn({ name: 'updated_at' })
    @ApiProperty({ description: 'Дата последней синхронизации с Шикимори' })
    updatedAt!: Date;

    @Expose()
    @ApiProperty({
        description: 'Постеры аниме (рекомендуется AVIF для современных устройств)',
        example: { 
            avif: '/static/animes/21.avif',
            webp: '/static/animes/21.webp', 
            jpeg: '/static/animes/21.jpeg',
            placeholder: '/static/animes/21-placeholder.jpeg' 
        },
    })
    get poster() {
        const domain = process.env.SHIKICINEMA_API_V1_DOMAIN || '/';
        const base = `${domain}static/animes/${this.id}`;

        return {
            avif: `${base}.avif`,
            webp: `${base}.webp`,
            jpeg: `${base}.jpeg`,
            placeholder: `${base}-placeholder.jpeg`,
        };
    }

    constructor(
        id: number,
        kind: AnimeKindEnum | null = null,
        rating: AgeRatingEnum | null = null,
        score: number | null = null,
        status: AnimeStatusEnum = AnimeStatusEnum.ANONS,
        duration: number | null = null,
        airedOn: Date | null = null,
        releasedOn: Date | null = null,
        nextEpisodeAt: Date | null = null,
        description: string | null = null,
        episodesTotal: number | null = null,
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
        this.episodesTotal = episodesTotal;
        this.tags = tags;
    }
}