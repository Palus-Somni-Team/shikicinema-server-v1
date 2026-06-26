import { Entity, PrimaryColumn } from 'typeorm';

@Entity('anime_genres')
export class AnimeGenreEntity {
    @PrimaryColumn({ name: 'anime_id', type: 'integer' })
    animeId!: number;

    @PrimaryColumn({ name: 'genre_id', type: 'integer' })
    genreId!: number;
}
