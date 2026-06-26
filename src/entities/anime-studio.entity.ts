import { Entity, PrimaryColumn } from 'typeorm';

@Entity('anime_studios')
export class AnimeStudioEntity {
    @PrimaryColumn({ name: 'anime_id', type: 'integer' })
    animeId!: number;

    @PrimaryColumn({ name: 'studio_id', type: 'integer' })
    studioId!: number;
}
