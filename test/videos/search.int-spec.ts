import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity } from '../../src/entities';
import { KindEnum, QualityEnum } from '../../src/videos/dto';

describe('search (integration)', () => {
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

    beforeEach(async () => {
        await repo.save([
            {
                animeId,
                episode: 1,
                url: 'http://a1.local',
                kind: KindEnum.DUBBING,
                language: 'ru',
                quality: QualityEnum.TV,
                author: 'Ancord',
                animeEnglish: 'Trigun',
                animeRussian: 'Триган',
            },
            {
                animeId,
                episode: 2,
                url: 'http://a2.local',
                kind: KindEnum.SUBTITLES,
                language: 'en',
                quality: QualityEnum.BD,
                author: 'AniDub',
                animeEnglish: 'Fullmetal Alchemist',
                animeRussian: 'Стальной алхимик',
            },
            {
                animeId,
                episode: 3,
                url: 'http://a3.local',
                kind: KindEnum.DUBBING,
                language: 'ru',
                quality: QualityEnum.WEB,
                author: 'Ancord',
                animeEnglish: 'Trigun: Badlands Rumble',
                animeRussian: 'Триган: Бесплодные земли',
            },
        ]);
    });

    afterEach(async () => {
        await repo.delete({ animeId });
    });

    it('returns all videos when no filters', async () => {
        const videos = await service.search({ offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(3);
    });

    it('searches by title in english', async () => {
        const videos = await service.search({ title: 'Trigun', offset: 0, limit: 50 });
        expect(videos.length).toBe(2);
        expect(videos.every(v => v.animeEnglish?.includes('Trigun'))).toBe(true);
    });

    it('searches by title in russian', async () => {
        const videos = await service.search({ title: 'Триган', offset: 0, limit: 50 });
        expect(videos.length).toBe(2);
        expect(videos.every(v => v.animeRussian?.includes('Триган'))).toBe(true);
    });

    it('filters by episode', async () => {
        const videos = await service.search({ episode: 2, offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(1);
        expect(videos.every(v => v.episode === 2)).toBe(true);
    });

    it('filters by kind', async () => {
        const videos = await service.search({ kind: KindEnum.SUBTITLES, offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(1);
        expect(videos.every(v => v.kind === KindEnum.SUBTITLES)).toBe(true);
    });

    it('filters by language', async () => {
        const videos = await service.search({ lang: 'en', offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(1);
        expect(videos.every(v => v.language === 'en')).toBe(true);
    });

    it('filters by quality', async () => {
        const videos = await service.search({ quality: QualityEnum.BD, offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(1);
        expect(videos.every(v => v.quality === QualityEnum.BD)).toBe(true);
    });

    it('filters by author (ILIKE)', async () => {
        const videos = await service.search({ author: 'Ancord', offset: 0, limit: 50 });
        expect(videos.length).toBeGreaterThanOrEqual(2);
        expect(videos.every(v => v.author === 'Ancord')).toBe(true);
    });

    it('applies pagination', async () => {
        const videos = await service.search({ offset: 0, limit: 2 });
        expect(videos.length).toBe(2);
    });
});