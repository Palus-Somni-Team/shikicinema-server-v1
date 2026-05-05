import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';
import { Repository, DataSource } from 'typeorm';
import request from 'supertest';
import { In } from 'typeorm';

import { VideosModule } from '../../src/videos/videos.module';
import { VideosService } from '../../src/videos/videos.service';
import { VideoEntity, AccessTokenEntity, UserEntity } from '../../src/entities';
import { KindEnum, QualityEnum } from '../../src/videos/dto';
import { DuplicateUrlException } from '../../src/domain';
import { addGlobal } from '../../src/add-global';

describe('createVideo (integration)', () => {
    const url = 'http://integration-test.local/video';

    let moduleFixture: TestingModule;
    let app: INestApplication;
    let service: VideosService;
    let repo: Repository<VideoEntity>;
    let userRepo: Repository<UserEntity>;
    let tokenRepo: Repository<AccessTokenEntity>;

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
                        entities: [VideoEntity, AccessTokenEntity, UserEntity],
                    }),
                }),
                VideosModule,
            ],
        }).compile();

        app = moduleFixture.createNestApplication();
        await addGlobal(app);
        await app.init();

        service = moduleFixture.get<VideosService>(VideosService);
        repo = moduleFixture.get<Repository<VideoEntity>>(getRepositoryToken(VideoEntity));
        userRepo = moduleFixture.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
        tokenRepo = moduleFixture.get<Repository<AccessTokenEntity>>(getRepositoryToken(AccessTokenEntity));
    });

    afterAll(async () => {
        const dataSource = moduleFixture.get(DataSource);
        if (dataSource.isInitialized) {
            await dataSource.destroy();
        }
        await app.close();
    });

    beforeEach(async () => {
        await repo.delete({ url });
    });

    afterEach(async () => {
        await repo.delete({ url });
    });

    it('creates and returns video entity', async () => {
        const video = await service.createVideo(
            {
                url,
                animeId: 99999,
                episode: 1,
                kind: KindEnum.DUBBING,
                language: 'ru',
            },
            '12345',
        );

        expect(video).toBeInstanceOf(VideoEntity);
        expect(video.url).toBe(url);
        expect(video.animeId).toBe(99999);
        expect(video.episode).toBe(1);
        expect(video.kind).toBe(KindEnum.DUBBING);
        expect(video.language).toBe('ru');
        expect(video.quality).toBe(QualityEnum.UNKNOWN);
        expect(video.author).toBeNull();
        expect(video.uploader).toBe('12345');
        expect(video.watchesCount).toBe(0);

        const inDb = await repo.findOne({ where: { url } });
        expect(inDb).not.toBeNull();
    });

    it('creates video with optional fields', async () => {
        const video = await service.createVideo(
            {
                url,
                animeId: 99999,
                episode: 1,
                kind: KindEnum.DUBBING,
                language: 'ru',
                author: 'Ancord',
                quality: QualityEnum.BD,
            },
            '12345',
        );

        expect(video.author).toBe('Ancord');
        expect(video.quality).toBe(QualityEnum.BD);
    });

    it('throws DuplicateUrlException on duplicate URL', async () => {
        await service.createVideo(
            { url, animeId: 99999, episode: 1, kind: KindEnum.DUBBING, language: 'ru' },
            '12345',
        );

        await expect(
            service.createVideo(
                { url, animeId: 88888, episode: 2, kind: KindEnum.SUBTITLES, language: 'en' },
                '12345',
            ),
        ).rejects.toThrow(DuplicateUrlException);

        const count = await repo.count({ where: { url } });
        expect(count).toBe(1);
    });

    describe('with auth (HTTP)', () => {
        const testToken = 'integration-test-token';

        beforeEach(async () => {
            const user = await userRepo.save({
                name: 'test-user',
                login: 'test-user',
                password: '********',
                email: 'test@test.local',
                scopes: ['database:shikivideos'],
                createdAt: new Date(),
                shikimoriId: '278015',
            });

            await tokenRepo.save({
                token: testToken,
                userId: `${user.id}`,
                clientId: 'test-client',
                scopes: ['database:shikivideos'],
                expires: new Date(Date.now() + 3600000),
            });
        });

        afterEach(async () => {
            await tokenRepo.deleteAll();
            await userRepo.deleteAll();
            await repo.delete({ url: 'http://auth-test.local' });
        });

        it('saves uploader from token', async () => {
            const { statusCode, body } = await request(app.getHttpServer())
                .post('/shikivideos')
                .set('Authorization', `Bearer ${testToken}`)
                .query({
                    url: 'http://auth-test.local',
                    anime_id: 99999,
                    episode: 1,
                    kind: 'озвучка',
                    language: 'ru',
                });

            expect(statusCode).toBe(201);
            expect(body).toMatchObject({ uploader: '278015' });
        });
    });

    describe('getContributions', () => {
        beforeEach(async () => {
            await service.createVideo(
                { url: 'http://contrib1.local', animeId: 99999, episode: 1, kind: KindEnum.DUBBING, language: 'ru' },
                '12345',
            );
            await service.createVideo(
                { url: 'http://contrib2.local', animeId: 99999, episode: 2, kind: KindEnum.DUBBING, language: 'ru' },
                '12345',
            );
            await service.createVideo(
                { url: 'http://contrib3.local', animeId: 99999, episode: 1, kind: KindEnum.SUBTITLES, language: 'en' },
                '67890',
            );
        });

        afterEach(async () => {
            await repo.delete({ url: In(['http://contrib1.local', 'http://contrib2.local', 'http://contrib3.local']) });
        });

        it('counts videos by uploader', async () => {

            const result = await service.getContributions({ uploader: '12345' });
            expect(result).toBe(2);
        });

        it('counts all without uploader', async () => {
            const result = await service.getContributions({});
            expect(result).toBeGreaterThanOrEqual(3);
        });
    });
});