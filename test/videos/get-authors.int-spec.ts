import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity } from '../../src/entities';
import { KindEnum } from '../../src/videos/dto';

describe('getAuthors (integration)', () => {
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

    beforeEach(async () => {
        await repo.save([
            { animeId: 1, episode: 1, url: 'http://a1.local', kind: KindEnum.DUBBING, language: 'ru', author: 'Ancord' },
            { animeId: 1, episode: 2, url: 'http://a2.local', kind: KindEnum.DUBBING, language: 'ru', author: 'Ancord' },
            { animeId: 2, episode: 1, url: 'http://b1.local', kind: KindEnum.SUBTITLES, language: 'en', author: 'AniDub' },
            { animeId: 2, episode: 2, url: 'http://b2.local', kind: KindEnum.SUBTITLES, language: 'en', author: 'AniDub' },
            { animeId: 3, episode: 1, url: 'http://c1.local', kind: KindEnum.ORIGINAL, language: 'ja', author: null },
        ]);
    });

    afterEach(async () => {
        await repo.delete({ animeId: 1 });
        await repo.delete({ animeId: 2 });
        await repo.delete({ animeId: 3 });
    });

    it('returns all unique authors when no filters', async () => {
        const authors = await service.getAuthors({ limit: 20 });

        expect(authors).toContain('Ancord');
        expect(authors).toContain('AniDub');
    });

    it('filters authors by name substring', async () => {
        const authors = await service.getAuthors({ name: 'Anc', limit: 20 });

        expect(authors).toEqual(['Ancord']);
    });

    it('filters authors by anime_id', async () => {
        const authors = await service.getAuthors({ animeId: 2, limit: 20 });

        expect(authors).toEqual(['AniDub']);
    });

    it('respects limit', async () => {
        const authors = await service.getAuthors({ limit: 1 });

        expect(authors.length).toBe(1);
    });

    it('excludes null authors', async () => {
        const authors = await service.getAuthors({ animeId: 3, limit: 20 });

        expect(authors).toEqual([]);
    });
});