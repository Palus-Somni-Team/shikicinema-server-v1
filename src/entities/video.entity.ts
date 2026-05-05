import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { QualityEnum } from '../videos/dto';

@Exclude()
@Entity('ShikiVideos')
export class VideoEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    id: number;

    @Column({ type: 'varchar', length: 2048, unique: true })
    @Expose()
    url: string;

    @Index()
    @Column({ type: 'integer', name: 'anime_id' })
    @Expose({ name: 'anime_id' })
    animeId: number;

    @Column({ type: 'integer' })
    @Expose()
    episode: number;

    @Column({ type: 'varchar', length: 32 })
    @Expose()
    kind: string;

    @Column({ type: 'varchar', length: 16, nullable: true })
    @Expose()
    language: string;

    @Column({ type: 'varchar', length: 16, default: QualityEnum.UNKNOWN })
    @Expose()
    quality: string;

    @Column({ type: 'varchar', length: 256, nullable: true })
    @Expose()
    author: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    @Expose()
    uploader: string | null;

    @Column({ type: 'integer', name: 'watches_count', default: 0 })
    @Expose({ name: 'watches_count' })
    watchesCount: number;

    @Column({ type: 'varchar', length: 512, nullable: true, name: 'anime_english' })
    @Expose({ name: 'anime_english' })
    animeEnglish: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true, name: 'anime_russian' })
    @Expose({ name: 'anime_russian' })
    animeRussian: string | null;

    constructor(
        animeId: number,
        episode: number,
        url: string,
        kind: string,
        language: string,
        uploader: string | null,
        author: string | null = null,
        quality: string = QualityEnum.UNKNOWN,
        watchesCount: number = 0,
        animeEnglish: string | null = null,
        animeRussian: string | null = null,
    ) {
        this.animeId = animeId;
        this.episode = episode;
        this.url = url;
        this.kind = kind;
        this.language = language;
        this.quality = quality;
        this.author = author;
        this.uploader = uploader;
        this.watchesCount = watchesCount;
        this.animeEnglish = animeEnglish;
        this.animeRussian = animeRussian;
    }
}
