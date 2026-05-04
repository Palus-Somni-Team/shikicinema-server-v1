import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity } from '../../src/entities';
import { KindEnum, QualityEnum } from '../../src/videos/dto';

describe('getByAnimeId (integration)', () => {
    let moduleFixture: TestingModule;
    let service: VideosService;
    let repo: Repository<VideoEntity>;

    beforeAll(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot(),
                TypeOrmModule.forRootAsync({
                    imports: [ConfigModule],
                    inject: [ConfigService],
                    useFactory: (config: ConfigService) => ({
                        type: 'postgres',
                        host: config.get<string>('DB_HOST'),
                        port: config.get<number>('DB_PORT'),
                        username: config.get<string>('DB_USER'),
                        password: config.get<string>('DB_PASSWORD'),
                        database: config.get<string>('DB_NAME'),
                        synchronize: false,
                        entities: [VideoEntity],
                    }),
                }),
                VideosModule,
            ],
        }).compile();

        service = moduleFixture.get<VideosService>(VideosService);
        repo = moduleFixture.get<Repository<VideoEntity>>(
            getRepositoryToken(VideoEntity),
        );
    });

    afterAll(async () => {
        const dataSource = moduleFixture.get(DataSource);
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
    });

    const animeId = 99999;
    const otherAnimeId = 88888;

    beforeEach(async () => {
        await repo.save([
            { animeId, episode: 1, url: 'http://a1.local', kind: KindEnum.DUBBING, language: 'ru', quality: QualityEnum.TV, author: 'Ancord' },
            { animeId, episode: 2, url: 'http://a2.local', kind: KindEnum.SUBTITLES, language: 'en', quality: QualityEnum.BD, author: 'AniDub' },
            { animeId, episode: 3, url: 'http://a3.local', kind: KindEnum.DUBBING, language: 'ru', quality: QualityEnum.WEB, author: 'Ancord' },
            { animeId: otherAnimeId, episode: 1, url: 'http://b1.local', kind: KindEnum.ORIGINAL, language: 'ja', quality: QualityEnum.DVD },
        ]);
    });

    afterEach(async () => {
        await repo.delete({ animeId });
        await repo.delete({ animeId: otherAnimeId });
    });

    it('returns all videos for anime_id', async () => {
        const videos = await service.getByAnimeId(animeId, {});

        expect(videos.length).toBe(3);
        expect(videos.every(v => v.animeId === animeId)).toBe(true);
    });

    it('filters by episode', async () => {
        const videos = await service.getByAnimeId(animeId, { episode: 1, offset: 0, limit: 50 });

        expect(videos.length).toBe(1);
        expect(videos[0].episode).toBe(1);
    });

    it('filters by kind', async () => {
        const videos = await service.getByAnimeId(animeId, { kind: KindEnum.SUBTITLES, offset: 0, limit: 50 });

        expect(videos.length).toBe(1);
        expect(videos[0].kind).toBe(KindEnum.SUBTITLES);
    });

    it('filters by language', async () => {
        const videos = await service.getByAnimeId(animeId, { lang: 'en', offset: 0, limit: 50 });

        expect(videos.length).toBe(1);
        expect(videos[0].language).toBe('en');
    });

    it('filters by quality', async () => {
        const videos = await service.getByAnimeId(animeId, { quality: QualityEnum.BD, offset: 0, limit: 50 });

        expect(videos.length).toBe(1);
        expect(videos[0].quality).toBe(QualityEnum.BD);
    });

    it('filters by author (ILIKE)', async () => {
        const videos = await service.getByAnimeId(animeId, { author: 'Ancord', offset: 0, limit: 50 });

        expect(videos.length).toBe(2);
        expect(videos.every(v => v.author === 'Ancord')).toBe(true);
    });

    it('applies pagination (offset/limit)', async () => {
        const videos = await service.getByAnimeId(animeId, { offset: 0, limit: 2 });

        expect(videos.length).toBe(2);
    });

    it('returns empty array for non-existing anime', async () => {
        const videos = await service.getByAnimeId(77777, {});

        expect(videos).toEqual([]);
    });
});