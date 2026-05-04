import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Repository, DataSource } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity } from '../../src/entities';

describe('getAnimeLength (integration)', () => {
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

    it('returns 0 for anime with no videos', async () => {
        const length = await service.getAnimeLength(99999999);
        expect(length).toBe(0);
    });

    it('returns max episode for anime with videos', async () => {
        const animeId = 99998;
        await repo.save([
            {
                animeId,
                episode: 3,
                url: 'http://a.local',
                kind: 'озвучка',
                language: 'ru',
            },
            {
                animeId,
                episode: 7,
                url: 'http://b.local',
                kind: 'озвучка',
                language: 'ru',
            },
            {
                animeId,
                episode: 5,
                url: 'http://c.local',
                kind: 'озвучка',
                language: 'ru',
            },
        ]);

        const length = await service.getAnimeLength(animeId);
        expect(length).toBe(7);

        await repo.delete({ animeId });
    });
});
