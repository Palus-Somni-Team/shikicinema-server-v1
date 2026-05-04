import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity('videos')
export class VideoEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 2048, unique: true })
    url: string;

    @Index()
    @Column({ type: 'integer', name: 'anime_id' })
    animeId: number;

    @Column({ type: 'integer' })
    episode: number;

    @Column({ type: 'varchar', length: 32 })
    kind: string;

    @Column({ type: 'varchar', length: 16, nullable: true })
    language: string;

    @Column({ type: 'varchar', length: 16, default: 'unknown' })
    quality: string;

    @Column({ type: 'varchar', length: 256, nullable: true })
    author: string;

    @Column({ type: 'varchar', length: 512, nullable: true })
    uploader: string;

    @Column({ type: 'integer', name: 'watches_count', default: 0 })
    watchesCount: number;
}
