import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    Index,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { KindEnum, QualityEnum } from '../videos/dto';

@Exclude()
@Entity('ShikiVideos')
export class VideoEntity {
    @PrimaryGeneratedColumn()
    @Expose()
    @ApiProperty({ example: 653321 })
    id: number;

    @Column({ type: 'varchar', length: 2048, unique: true })
    @Expose()
    @ApiProperty({ example: 'https://youtube.com/embed/dQw4w9WgXcQ' })
    url: string;

    @Index()
    @Column({ type: 'integer', name: 'anime_id' })
    @Expose({ name: 'anime_id' })
    @ApiProperty({ example: 21, name: 'anime_id' })
    animeId: number;

    @Column({ type: 'integer' })
    @Expose()
    @ApiProperty({ example: 3 })
    episode: number;

    @Column({ type: 'varchar', length: 32 })
    @Expose()
    @ApiProperty({ example: KindEnum.DUBBING, enum: KindEnum })
    kind: KindEnum;

    @Column({ type: 'varchar', length: 16, nullable: true })
    @Expose()
    @ApiProperty({ example: 'ru' })
    language: string;

    @Column({ type: 'varchar', length: 16, default: QualityEnum.UNKNOWN })
    @Expose()
    @ApiPropertyOptional({ example: QualityEnum.BD, enum: QualityEnum })
    quality: QualityEnum;

    @Column({ type: 'varchar', length: 256, nullable: true })
    @Expose()
    @ApiPropertyOptional({ example: 'Persona 99', type: 'string', nullable: true })
    author: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
    @Expose()
    @ApiProperty({ example: '278015', type: 'string', nullable: true })
    uploader: string | null;

    @Column({ type: 'integer', name: 'watches_count', default: 0 })
    @Expose({ name: 'watches_count' })
    @ApiPropertyOptional({ example: 1000, name: 'watches_count' })
    watchesCount: number;

    @Column({ type: 'varchar', length: 512, nullable: true, name: 'anime_english' })
    @Expose({ name: 'anime_english' })
    @ApiPropertyOptional({ example: 'One Piece', name: 'anime_english' })
    animeEnglish: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true, name: 'anime_russian' })
    @Expose({ name: 'anime_russian' })
    @ApiPropertyOptional({ example: 'Ванпис', name: 'anime_russian' })
    animeRussian: string | null;

    constructor(
        animeId: number,
        episode: number,
        url: string,
        kind: KindEnum,
        language: string,
        uploader: string | null,
        author: string | null = null,
        quality: QualityEnum = QualityEnum.UNKNOWN,
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
